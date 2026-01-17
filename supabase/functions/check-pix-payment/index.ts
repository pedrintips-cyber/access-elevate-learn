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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get auth header to identify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;

    const { external_id } = await req.json();

    if (!external_id) {
      return new Response(
        JSON.stringify({ error: 'Missing external_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking payment status for:', external_id, 'user:', userId);

    // Get transaction from database
    const { data: transaction, error: dbError } = await supabase
      .from('pix_transactions')
      .select('*')
      .eq('external_id', external_id)
      .eq('user_id', userId)
      .single();

    if (dbError || !transaction) {
      console.error('Transaction not found:', dbError);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already approved, return the token
    if (transaction.status === 'approved') {
      // Get the token that was assigned (stored in end_to_end_id field)
      const assignedToken = transaction.end_to_end_id;
      
      return new Response(
        JSON.stringify({
          status: 'approved',
          token: assignedToken,
          message: 'Payment confirmed! Use this token to activate your VIP.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we should poll HuraPay API for status update
    const huraPublicKey = Deno.env.get('HURAPAY_PUBLIC_KEY');
    const huraSecretKey = Deno.env.get('HURAPAY_SECRET_KEY');

    if (huraPublicKey && huraSecretKey && transaction.tribopay_id) {
      const basicAuth = btoa(`${huraPublicKey}:${huraSecretKey}`);
      
      try {
        // Try to fetch transaction status from HuraPay
        const huraResponse = await fetch(
          `https://api.hurapayments.com.br/v1/payment-transaction/${transaction.tribopay_id}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Basic ${basicAuth}`,
            },
          }
        );

        if (huraResponse.ok) {
          const huraData = await huraResponse.json();
          console.log('HuraPay status check:', huraData);

          const huraStatus = huraData.status;
          
          if (huraStatus === 'paid' || huraStatus === 'approved' || huraStatus === 'completed') {
            // Payment was approved, process it
            console.log('Payment confirmed via polling!');

            // Find available token
            const { data: availableToken } = await supabase
              .from('vip_tokens')
              .select('*')
              .eq('is_used', false)
              .limit(1)
              .single();

            if (availableToken) {
              // Use the token
              await supabase.rpc('use_vip_token', {
                token_input: availableToken.token,
                user_id_input: userId
              });

              // Update transaction
              await supabase
                .from('pix_transactions')
                .update({
                  status: 'approved',
                  paid_at: new Date().toISOString(),
                  end_to_end_id: availableToken.token
                })
                .eq('id', transaction.id);

              return new Response(
                JSON.stringify({
                  status: 'approved',
                  token: availableToken.token,
                  message: 'Payment confirmed! Use this token to activate your VIP.'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }
      } catch (pollError) {
        console.error('Error polling HuraPay:', pollError);
        // Continue with current status
      }
    }

    return new Response(
      JSON.stringify({
        status: transaction.status,
        message: transaction.status === 'pending' ? 'Waiting for payment...' : 'Payment status: ' + transaction.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
