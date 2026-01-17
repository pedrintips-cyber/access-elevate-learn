import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // HuraPay webhook format - extract transaction info
    const transactionId = body.id || body.transaction_id;
    const status = body.status;
    const metadata = body.metadata || {};
    const externalId = metadata.external_id;
    const userId = metadata.user_id;

    console.log('Transaction ID:', transactionId);
    console.log('Status:', status);
    console.log('External ID:', externalId);
    console.log('User ID:', userId);

    // Map HuraPay status to our status
    let mappedStatus = status;
    if (status === 'paid' || status === 'approved' || status === 'completed') {
      mappedStatus = 'approved';
    } else if (status === 'pending' || status === 'waiting_payment') {
      mappedStatus = 'pending';
    } else if (status === 'refused' || status === 'failed' || status === 'cancelled') {
      mappedStatus = 'failed';
    }

    // Find transaction by external_id or tribopay_id
    let transaction;
    
    if (externalId) {
      const { data, error } = await supabase
        .from('pix_transactions')
        .select('*')
        .eq('external_id', externalId)
        .single();
      
      if (!error && data) {
        transaction = data;
      }
    }

    if (!transaction && transactionId) {
      const { data, error } = await supabase
        .from('pix_transactions')
        .select('*')
        .eq('tribopay_id', transactionId)
        .single();
      
      if (!error && data) {
        transaction = data;
      }
    }

    if (!transaction) {
      console.error('Transaction not found');
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found transaction:', transaction.id);

    // Update transaction status
    const { error: updateError } = await supabase
      .from('pix_transactions')
      .update({
        status: mappedStatus,
        paid_at: mappedStatus === 'approved' ? new Date().toISOString() : null,
        end_to_end_id: body.end_to_end_id || body.pix?.end_to_end_id || null,
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
    }

    // If payment approved, assign VIP token to user
    if (mappedStatus === 'approved' && transaction.user_id) {
      console.log('Payment approved, assigning VIP token to user:', transaction.user_id);

      // Find an available token
      const { data: availableToken, error: tokenError } = await supabase
        .from('vip_tokens')
        .select('*')
        .eq('is_used', false)
        .limit(1)
        .single();

      if (tokenError || !availableToken) {
        console.error('No available VIP tokens:', tokenError);
        // Still mark payment as approved, but log the issue
      } else {
        console.log('Found available token:', availableToken.token);

        // Use the token for this user
        const { data: useResult, error: useError } = await supabase.rpc('use_vip_token', {
          token_input: availableToken.token,
          user_id_input: transaction.user_id
        });

        if (useError) {
          console.error('Error using VIP token:', useError);
        } else {
          console.log('VIP token activated:', useResult);
        }

        // Update transaction with the assigned token
        await supabase
          .from('pix_transactions')
          .update({ end_to_end_id: availableToken.token })
          .eq('id', transaction.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: mappedStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
