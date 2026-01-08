import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData = await req.json();
    console.log('PIX Webhook received from SyncPay:', JSON.stringify(webhookData, null, 2));

    // SyncPay webhook payload structure
    // Extract identifier (used as our external_id reference via tribopay_id column)
    const identifier = webhookData.identifier || webhookData.id;
    const status = webhookData.status;
    const endToEndId = webhookData.end_to_end_id || webhookData.endToEndId;

    if (!identifier) {
      console.error('Webhook missing identifier');
      return new Response(
        JSON.stringify({ error: 'Missing identifier' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map SyncPay status to our status
    let mappedStatus = status;
    if (status === 'completed' || status === 'approved' || status === 'confirmed') {
      mappedStatus = 'paid';
    } else if (status === 'pending' || status === 'processing') {
      mappedStatus = 'waiting_payment';
    } else if (status === 'expired' || status === 'cancelled' || status === 'failed') {
      mappedStatus = 'expired';
    }

    console.log(`Updating transaction with SyncPay ID ${identifier} to status: ${mappedStatus}`);

    // Update transaction status using the tribopay_id field (stores SyncPay identifier)
    const updateData: Record<string, unknown> = {
      status: mappedStatus,
      updated_at: new Date().toISOString(),
    };

    if (endToEndId) {
      updateData.end_to_end_id = endToEndId;
    }

    if (mappedStatus === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }

    const { data: transaction, error: updateError } = await supabase
      .from('pix_transactions')
      .update(updateData)
      .eq('tribopay_id', identifier)
      .select('user_id, amount')
      .single();

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      
      // Try to find by external_id as fallback
      console.log('Trying to find transaction by external_id...');
      const { data: txByExternal, error: fallbackError } = await supabase
        .from('pix_transactions')
        .update(updateData)
        .eq('external_id', identifier)
        .select('user_id, amount')
        .single();

      if (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return new Response(
          JSON.stringify({ error: 'Failed to update transaction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use fallback result
      if (mappedStatus === 'paid' && txByExternal?.user_id) {
        await activateVip(supabase, txByExternal.user_id);
      }

      return new Response(
        JSON.stringify({ success: true, identifier, status: mappedStatus }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Transaction updated:', transaction);

    // If payment is confirmed (paid), activate VIP for the user
    if (mappedStatus === 'paid' && transaction?.user_id) {
      await activateVip(supabase, transaction.user_id);
    }

    return new Response(
      JSON.stringify({ success: true, identifier, status: mappedStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// deno-lint-ignore no-explicit-any
async function activateVip(supabase: any, userId: string) {
  console.log(`Activating VIP for user ${userId}`);
  
  // Calculate VIP expiration (30 days from now for standard VIP)
  const vipExpiresAt = new Date();
  vipExpiresAt.setDate(vipExpiresAt.getDate() + 30);

  const { error: vipError } = await supabase
    .from('profiles')
    .update({
      is_vip: true,
      vip_expires_at: vipExpiresAt.toISOString(),
    })
    .eq('id', userId);

  if (vipError) {
    console.error('Error activating VIP:', vipError);
  } else {
    console.log(`VIP activated for user ${userId} until ${vipExpiresAt.toISOString()}`);
  }
}
