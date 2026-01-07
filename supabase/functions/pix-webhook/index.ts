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
    console.log('PIX Webhook received:', JSON.stringify(webhookData, null, 2));

    // Extract relevant data from webhook
    const externalId = webhookData.externalId || webhookData.external_id;
    const status = webhookData.status;
    const endToEndId = webhookData.endToEndId || webhookData.end_to_end_id;

    if (!externalId) {
      console.error('Webhook missing externalId');
      return new Response(
        JSON.stringify({ error: 'Missing externalId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Updating transaction ${externalId} to status: ${status}`);

    // Update transaction status
    const updateData: Record<string, unknown> = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (endToEndId) {
      updateData.end_to_end_id = endToEndId;
    }

    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }

    const { data: transaction, error: updateError } = await supabase
      .from('pix_transactions')
      .update(updateData)
      .eq('external_id', externalId)
      .select('user_id, amount')
      .single();

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Transaction updated:', transaction);

    // If payment is confirmed (paid), activate VIP for the user
    if (status === 'paid' && transaction?.user_id) {
      console.log(`Activating VIP for user ${transaction.user_id}`);
      
      // Calculate VIP expiration (30 days from now for standard VIP)
      const vipExpiresAt = new Date();
      vipExpiresAt.setDate(vipExpiresAt.getDate() + 30);

      const { error: vipError } = await supabase
        .from('profiles')
        .update({
          is_vip: true,
          vip_expires_at: vipExpiresAt.toISOString(),
        })
        .eq('id', transaction.user_id);

      if (vipError) {
        console.error('Error activating VIP:', vipError);
      } else {
        console.log(`VIP activated for user ${transaction.user_id} until ${vipExpiresAt.toISOString()}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, externalId, status }),
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
