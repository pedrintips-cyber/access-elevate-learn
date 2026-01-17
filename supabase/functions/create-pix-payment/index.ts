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
    const huraPublicKey = Deno.env.get('HURAPAY_PUBLIC_KEY');
    const huraSecretKey = Deno.env.get('HURAPAY_SECRET_KEY');

    if (!huraPublicKey || !huraSecretKey) {
      console.error('HuraPay credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      console.error('Auth error:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email || 'cliente@email.com';

    // Amount in cents (R$ 250,00 = 25000 cents)
    const amountInCents = 25000;
    const externalId = `vip_${userId}_${Date.now()}`;

    // Create Basic Auth header for HuraPay
    const basicAuth = btoa(`${huraPublicKey}:${huraSecretKey}`);

    // Webhook URL for payment confirmation
    const webhookUrl = `${supabaseUrl}/functions/v1/pix-webhook`;

    console.log('Creating HuraPay transaction for user:', userId);
    console.log('Webhook URL:', webhookUrl);

    // Create PIX transaction with HuraPay
    const huraResponse = await fetch('https://api.hurapayments.com.br/v1/payment-transaction/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: amountInCents,
        payment_method: 'pix',
        postback_url: webhookUrl,
        customer: {
          name: 'Cliente VIP',
          email: userEmail,
          document: {
            type: 'cpf',
            number: '00000000000' // Placeholder - HuraPay may not require real CPF
          }
        },
        items: [
          {
            title: 'VIP Access - 30 dias',
            quantity: 1,
            unit_price: amountInCents,
            tangible: false
          }
        ],
        metadata: {
          provider_name: 'VIP Access',
          user_id: userId,
          external_id: externalId
        }
      }),
    });

    const responseText = await huraResponse.text();
    console.log('HuraPay response status:', huraResponse.status);
    console.log('HuraPay response:', responseText);

    if (!huraResponse.ok) {
      console.error('HuraPay API error:', responseText);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment', details: responseText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const huraData = JSON.parse(responseText);

    // Extract PIX data from response
    const transactionId = huraData.id || huraData.transaction_id;
    const qrCode = huraData.pix?.qr_code || huraData.qr_code;
    const qrCodeImage = huraData.pix?.qr_code_url || huraData.qr_code_url || huraData.pix?.qr_code_image;

    console.log('Transaction created:', transactionId);
    console.log('QR Code available:', !!qrCode);

    // Save transaction to database
    const { error: dbError } = await supabase.from('pix_transactions').insert({
      external_id: externalId,
      user_id: userId,
      amount: 250.00,
      status: 'pending',
      payer_name: 'Cliente VIP',
      payer_email: userEmail,
      payer_document: '00000000000',
      qr_code: qrCode,
      qr_code_image: qrCodeImage,
      tribopay_id: transactionId, // Reusing this field for HuraPay ID
    });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transactionId,
        external_id: externalId,
        qr_code: qrCode,
        qr_code_image: qrCodeImage,
        amount: 250.00,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
