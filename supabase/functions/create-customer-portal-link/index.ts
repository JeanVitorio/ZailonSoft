// supabase/functions/create-customer-portal-link/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.5.0';
import { corsHeaders } from '../_shared/cors.ts';

// Inicializa o cliente Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY não está definida nas variáveis de ambiente.');
}
const stripe = new Stripe(stripeSecretKey);

serve(async (req) => {
  // Responde à requisição OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  // Verifica se a requisição é POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido. Use POST.' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Validar variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY');
    const siteUrl = Deno.env.get('SITE_URL');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !siteUrl) {
      throw new Error('Uma ou mais variáveis de ambiente não estão definidas.');
    }

    // Criar cliente Supabase para autenticação
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });

    // Obter usuário autenticado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado.');
    }

    // Criar cliente Supabase com service role para consultas administrativas
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Buscar stripe_customer_id na tabela subscriptions
    const { data: subData, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subError || !subData?.stripe_customer_id) {
      throw new Error('Não foi possível encontrar o ID de cliente Stripe.');
    }

    const { stripe_customer_id } = subData;

    // Criar sessão do Portal do Cliente Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripe_customer_id,
      return_url: `${siteUrl}/sistema`,
    });

    // Retornar URL do portal
    return new Response(
      JSON.stringify({ portalUrl: portalSession.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});