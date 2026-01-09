import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VIP_DAYS_PRIZE = 30;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to get their ID
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { transactionExternalId, amount } = await req.json();

    if (!transactionExternalId || !amount) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the transaction exists and belongs to this user
    const { data: transaction, error: txError } = await supabase
      .from("pix_transactions")
      .select("*")
      .eq("external_id", transactionExternalId)
      .eq("user_id", user.id)
      .eq("status", "completed")
      .maybeSingle();

    if (txError || !transaction) {
      return new Response(
        JSON.stringify({ error: "Transação não encontrada ou não confirmada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this transaction was already used for a spin
    const { data: existingSpin } = await supabase
      .from("roulette_spins")
      .select("id")
      .eq("transaction_id", transaction.id)
      .maybeSingle();

    if (existingSpin) {
      return new Response(
        JSON.stringify({ error: "Esta transação já foi usada para girar a roleta" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 50/50 chance - true random
    const result: "win" | "lose" = Math.random() < 0.5 ? "win" : "lose";
    const vipDaysWon = result === "win" ? VIP_DAYS_PRIZE : 0;

    // Record the spin
    const { error: spinError } = await supabase
      .from("roulette_spins")
      .insert({
        user_id: user.id,
        transaction_id: transaction.id,
        amount: amount,
        result: result,
        vip_days_won: vipDaysWon,
      });

    if (spinError) {
      console.error("Error recording spin:", spinError);
      return new Response(
        JSON.stringify({ error: "Erro ao registrar giro" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If won, update VIP status
    if (result === "win") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_vip, vip_expires_at")
        .eq("id", user.id)
        .single();

      let newExpiresAt: Date;
      
      if (profile?.is_vip && profile?.vip_expires_at && new Date(profile.vip_expires_at) > new Date()) {
        // Extend existing VIP
        newExpiresAt = new Date(profile.vip_expires_at);
        newExpiresAt.setDate(newExpiresAt.getDate() + vipDaysWon);
      } else {
        // New VIP
        newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + vipDaysWon);
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_vip: true,
          vip_expires_at: newExpiresAt.toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating VIP status:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        result: result,
        vip_days_won: vipDaysWon,
        message: result === "win" 
          ? `Parabéns! Você ganhou ${vipDaysWon} dias de VIP!` 
          : "Não foi dessa vez. Tente novamente!"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
