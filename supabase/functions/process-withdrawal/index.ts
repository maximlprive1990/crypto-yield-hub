import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WithdrawalRequest {
  amount: number;
  currency: string;
  description?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { amount, currency, description }: WithdrawalRequest = await req.json();

    // Validate input
    if (!amount || amount <= 0 || !currency) {
      return new Response(
        JSON.stringify({ error: "Montant et devise requis" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create withdrawal request in database
    const { data: withdrawalData, error: dbError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount,
        currency,
        description: description || `Retrait de ${amount} ${currency}`,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'enregistrement de la demande" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user profile for additional info
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single();

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "CryptoStake Pro <onboarding@resend.dev>",
      to: ["maximlprive90@gmail.com"],
      subject: `Nouvelle demande de retrait - ${amount} ${currency}`,
      html: `
        <h1>Nouvelle demande de retrait</h1>
        <p><strong>ID de la demande:</strong> ${withdrawalData.id}</p>
        <p><strong>Utilisateur:</strong> ${profile?.username || user.email}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Montant:</strong> ${amount} ${currency}</p>
        <p><strong>Description:</strong> ${description || 'Aucune description'}</p>
        <p><strong>Date de demande:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        
        <hr>
        
        <p>Cette demande est en attente de traitement.</p>
        <p>Délai estimé: 2h à 24h</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        withdrawalId: withdrawalData.id,
        message: "Demande de retrait créée avec succès" 
      }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in process-withdrawal function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur interne du serveur" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);