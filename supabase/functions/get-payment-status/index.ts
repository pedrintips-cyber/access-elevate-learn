import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUCKPAY_API_URL = 'https://api.realtechdev.com.br';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const buckpayToken = Deno.env.get('BUCKPAY_TOKEN');
    const buckpayUserAgent = Deno.env.get('BUCKPAY_USER_AGENT');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const externalId = url.searchParams.get('externalId');

    if (!externalId) {
      return new Response(
        JSON.stringify({ error: 'externalId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First check our local database
    const { data: transaction, error } = await supabase
      .from('pix_transactions')
      .select('*')
      .eq('external_id', externalId)
      .single();

    if (error || !transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If we have BuckPay credentials and the payment is still pending, check BuckPay API
    if (buckpayToken && buckpayUserAgent && transaction.status === 'waiting_payment') {
      try {
        console.log(`Checking BuckPay status for external_id: ${externalId}`);
        
        const buckpayResponse = await fetch(
          `${BUCKPAY_API_URL}/v1/transactions/external_id/${externalId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${buckpayToken}`,
              'User-Agent': buckpayUserAgent
            }
          }
        );

        if (buckpayResponse.ok) {
          const buckpayData = await buckpayResponse.json();
          console.log('BuckPay status response:', JSON.stringify(buckpayData, null, 2));

          const buckpayStatus = buckpayData.data?.status;
          
          // Map BuckPay status
          let mappedStatus = transaction.status;
          if (buckpayStatus === 'paid') {
            mappedStatus = 'paid';
          } else if (buckpayStatus === 'expired' || buckpayStatus === 'cancelled') {
            mappedStatus = 'expired';
          }

          // Update local status if changed
          if (mappedStatus !== transaction.status) {
            const updateData: Record<string, unknown> = {
              status: mappedStatus,
              updated_at: new Date().toISOString(),
            };

            if (mappedStatus === 'paid') {
              updateData.paid_at = new Date().toISOString();
            }

            await supabase
              .from('pix_transactions')
              .update(updateData)
              .eq('external_id', externalId);

            // Activate VIP if paid
            if (mappedStatus === 'paid' && transaction.user_id) {
              const vipExpiresAt = new Date();
              vipExpiresAt.setDate(vipExpiresAt.getDate() + 30);

              await supabase
                .from('profiles')
                .update({
                  is_vip: true,
                  vip_expires_at: vipExpiresAt.toISOString(),
                })
                .eq('id', transaction.user_id);
            }

            transaction.status = mappedStatus;
          }
        }
      } catch (apiError) {
        console.error('Error checking BuckPay status:', apiError);
        // Continue with local status
      }
    }

    return new Response(
      JSON.stringify({
        externalId: transaction.external_id,
        status: transaction.status,
        amount: transaction.amount,
        qrCode: transaction.qr_code,
        qrCodeImage: transaction.qr_code_image,
        endToEndId: transaction.end_to_end_id,
        paidAt: transaction.paid_at,
        createdAt: transaction.created_at,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching payment status:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
