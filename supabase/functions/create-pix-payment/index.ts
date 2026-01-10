import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUCKPAY_API_URL = 'https://api.realtechdev.com.br';

interface PayerData {
  name: string;
  email: string;
  document: string;
  phone?: string;
}

interface CreatePixRequest {
  amount: number;
  payer: PayerData;
  userId?: string;
}

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
    
    if (!buckpayToken || !buckpayUserAgent) {
      console.error('Missing BuckPay credentials');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreatePixRequest = await req.json();
    console.log('Received payment request:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!body.payer?.name || !body.payer?.email || !body.payer?.document) {
      return new Response(
        JSON.stringify({ error: 'Missing payer information' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate external ID
    const externalId = `vip_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create PIX payment with BuckPay API
    console.log('Creating PIX payment with BuckPay...');
    
    const buckpayPayload = {
      external_id: externalId,
      payment_method: 'pix',
      amount: body.amount, // Amount in cents
      buyer: {
        name: body.payer.name,
        email: body.payer.email,
        document: body.payer.document.replace(/\D/g, ''), // Remove non-digits
        phone: body.payer.phone || undefined
      },
      product: {
        id: 'vip_access',
        name: 'Acesso VIP'
      }
    };

    console.log('BuckPay payload:', JSON.stringify(buckpayPayload, null, 2));

    const buckpayResponse = await fetch(`${BUCKPAY_API_URL}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buckpayToken}`,
        'User-Agent': buckpayUserAgent
      },
      body: JSON.stringify(buckpayPayload)
    });

    const buckpayData = await buckpayResponse.json();
    console.log('BuckPay response:', JSON.stringify(buckpayData, null, 2));

    if (!buckpayResponse.ok) {
      console.error('BuckPay API error:', buckpayData);
      return new Response(
        JSON.stringify({ 
          error: 'Payment creation failed', 
          details: buckpayData.error?.message || 'Unknown error'
        }),
        { status: buckpayResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract PIX data from BuckPay response
    const pixCode = buckpayData.data?.pix?.code;
    const qrCodeBase64 = buckpayData.data?.pix?.qrcode_base64;
    const buckpayId = buckpayData.data?.id;

    if (!pixCode) {
      console.error('No PIX code in response');
      return new Response(
        JSON.stringify({ error: 'Failed to generate PIX code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save transaction to database
    const { error: insertError } = await supabase
      .from('pix_transactions')
      .insert({
        external_id: externalId,
        tribopay_id: buckpayId, // Reusing this column for BuckPay ID
        user_id: body.userId || null,
        amount: body.amount,
        status: 'waiting_payment',
        payer_name: body.payer.name,
        payer_email: body.payer.email,
        payer_document: body.payer.document,
        qr_code: pixCode,
        qr_code_image: qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null
      });

    if (insertError) {
      console.error('Error saving transaction:', insertError);
      // Continue anyway - payment was created
    }

    return new Response(
      JSON.stringify({
        success: true,
        externalId,
        pixCode,
        qrCodeImage: qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null,
        amount: body.amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating PIX payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
