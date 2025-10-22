// supabase/functions/create-customer-portal-link/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe'
import { corsHeaders } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Pega o usuário logado pelo token de autorização
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("Usuário não autenticado.")

    // 2. Pega o ID de cliente do Stripe salvo no seu banco de dados
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      // Use a CUSTOM_SUPABASE_SERVICE_ROLE_KEY se você a definiu, senão use SUPABASE_SERVICE_ROLE_KEY
      Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')! 
    );
    
    const { data: subData, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subError || !subData?.stripe_customer_id) {
      throw new Error("Não foi possível encontrar seu ID de cliente Stripe.");
    }
    
    const { stripe_customer_id } = subData;

    // 3. Cria a sessão do Portal do Cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripe_customer_id,
      return_url: `${Deno.env.get('SITE_URL')}/sistema`, // Para onde o cliente volta
    });

    // 4. Retorna a URL do portal
    return new Response(JSON.stringify({ portalUrl: portalSession.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
