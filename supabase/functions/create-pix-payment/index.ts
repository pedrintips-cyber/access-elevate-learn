import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayerData {
  name: string;
  email: string;
  document: string;
}

interface CreatePixRequest {
  amount: number; // in cents
  externalId: string;
  payer: PayerData;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const tribopayToken = Deno.env.get('TRIBOPAY_TOKEN');
    if (!tribopayToken) {
      console.error('TRIBOPAY_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Token de pagamento não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Build postback URL
    const postbackUrl = `${supabaseUrl}/functions/v1/pix-webhook`;

    console.log('Creating PIX payment with TriboPay:', { amount, externalId, postbackUrl });

    // Call TriboPay API
    const tribopayResponse = await fetch('https://api.tribopay.com.br/api/public/cash/deposits/pix', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${tribopayToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        externalId,
        postbackUrl,
        method: 'pix',
        transactionOrigin: 'cashin',
        payer: {
          name: payer.name.trim(),
          email: payer.email.trim().toLowerCase(),
          document: cpfClean,
        },
      }),
    });

    const tribopayData = await tribopayResponse.json();
    console.log('TriboPay response:', tribopayResponse.status, tribopayData);

    if (!tribopayResponse.ok) {
      console.error('TriboPay error:', tribopayData);
      
      let errorMessage = 'Erro ao criar pagamento PIX';
      if (tribopayResponse.status === 401) {
        errorMessage = 'Token de autenticação inválido';
      } else if (tribopayResponse.status === 422) {
        errorMessage = 'Dados inválidos: ' + (tribopayData.message || JSON.stringify(tribopayData));
      } else if (tribopayResponse.status === 400) {
        errorMessage = 'Requisição inválida: ' + (tribopayData.message || JSON.stringify(tribopayData));
      }

      return new Response(
        JSON.stringify({ error: errorMessage, details: tribopayData }),
        { status: tribopayResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract PIX data from response - TriboPay returns it inside 'pix' object
    const pixCode = tribopayData.pix?.code || tribopayData.pixCopiaECola || tribopayData.qrCode || null;
    const pixImage = tribopayData.pix?.imageBase64 || tribopayData.imageBase64 || null;

    console.log('Extracted PIX data:', { pixCode: pixCode ? 'present' : 'missing', pixImage: pixImage ? 'present' : 'missing' });

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
        qr_code_image: pixImage,
        tribopay_id: tribopayData.id || null,
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
        qrCodeImage: pixImage,
        amount,
        status: 'waiting_payment',
        tribopayId: tribopayData.id,
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
