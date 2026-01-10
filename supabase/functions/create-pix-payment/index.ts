import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYNCPAY_BASE_URL = 'https://api.syncpayments.com.br';

interface PayerData {
  name: string;
  email: string;
  document: string;
  phone?: string;
}

interface CreatePixRequest {
  amount: number; // in cents
  externalId: string;
  payer: PayerData;
  userId?: string;
}

// Cache for access token
let cachedToken: { token: string; expiresAt: Date } | null = null;

async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > new Date()) {
    console.log('Using cached SyncPay token');
    return cachedToken.token;
  }

  const clientId = Deno.env.get('SYNCPAY_CLIENT_ID');
  const clientSecret = Deno.env.get('SYNCPAY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('SyncPay credentials not configured');
  }

  console.log('Requesting new SyncPay access token');

  const response = await fetch(`${SYNCPAY_BASE_URL}/api/partner/v1/auth-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('SyncPay auth error:', data);
    throw new Error('Failed to authenticate with SyncPay');
  }

  // Cache the token (subtract 5 minutes for safety margin)
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in - 300));
  
  cachedToken = {
    token: data.access_token,
    expiresAt,
  };

  console.log('SyncPay token obtained, expires at:', expiresAt.toISOString());
  return data.access_token;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { amount, externalId, payer, userId }: CreatePixRequest = await req.json();

    // Validations
    if (!amount || amount < 100) {
      return new Response(
        JSON.stringify({ error: 'Valor mínimo é R$ 1,00 (100 centavos)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payer.name || payer.name.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: 'Nome inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payer.email || !emailRegex.test(payer.email)) {
      return new Response(
        JSON.stringify({ error: 'E-mail inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cpfClean = payer.document.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      return new Response(
        JSON.stringify({ error: 'CPF deve ter 11 dígitos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Build webhook URL
    const webhookUrl = `${supabaseUrl}/functions/v1/pix-webhook`;

    // Convert amount from cents to reais (SyncPay expects reais)
    const amountInReais = amount / 100;

    console.log('Creating PIX payment with SyncPay:', { 
      amount: amountInReais, 
      externalId, 
      webhookUrl 
    });

    // Call SyncPay API
    const syncpayResponse = await fetch(`${SYNCPAY_BASE_URL}/api/partner/v1/cash-in`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInReais,
        description: `Async VIP - ${externalId}`,
        webhook_url: webhookUrl,
        client: {
          name: payer.name.trim(),
          cpf: cpfClean,
          email: payer.email.trim().toLowerCase(),
          phone: payer.phone?.replace(/\D/g, '') || '',
        },
      }),
    });

    const syncpayData = await syncpayResponse.json();
    console.log('SyncPay response:', syncpayResponse.status, syncpayData);

    if (!syncpayResponse.ok) {
      console.error('SyncPay error:', syncpayData);
      
      let errorMessage = 'Erro ao criar pagamento PIX';
      if (syncpayResponse.status === 401) {
        errorMessage = 'Token de autenticação inválido';
        // Clear cached token on auth error
        cachedToken = null;
      } else if (syncpayResponse.status === 422) {
        errorMessage = 'Dados inválidos: ' + (syncpayData.message || JSON.stringify(syncpayData));
      } else if (syncpayResponse.status === 400) {
        errorMessage = 'Requisição inválida: ' + (syncpayData.message || JSON.stringify(syncpayData));
      }

      return new Response(
        JSON.stringify({ error: errorMessage, details: syncpayData }),
        { status: syncpayResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract PIX data from response
    const pixCode = syncpayData.pix_code || null;
    const syncpayId = syncpayData.identifier || null;

    console.log('Extracted PIX data:', { 
      pixCode: pixCode ? 'present (' + pixCode.length + ' chars)' : 'missing', 
      syncpayId 
    });

    // Save transaction to database
    const { error: dbError } = await supabase
      .from('pix_transactions')
      .insert({
        external_id: externalId,
        user_id: userId || null,
        amount,
        status: 'waiting_payment',
        payer_name: payer.name.trim(),
        payer_email: payer.email.trim().toLowerCase(),
        payer_document: cpfClean,
        qr_code: pixCode,
        qr_code_image: null, // SyncPay doesn't return image, will generate on frontend
        tribopay_id: syncpayId, // Reusing field for SyncPay identifier
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request, payment was created
    }

    return new Response(
      JSON.stringify({
        success: true,
        externalId,
        qrCode: pixCode,
        qrCodeImage: null,
        amount,
        status: 'waiting_payment',
        syncpayId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating PIX payment:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar pagamento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
