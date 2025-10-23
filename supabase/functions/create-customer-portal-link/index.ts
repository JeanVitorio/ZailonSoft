// supabase/functions/create-customer-portal-link/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe';

// ----------------------------------------------------------------------------------
// 🚨 CÓDIGO LIMPO: Lê todas as chaves dos Secrets (Deno.env.get)
// ----------------------------------------------------------------------------------
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
// Usando o nome de secret mais provável da sua lista:
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); 
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const SITE_URL = Deno.env.get('SITE_URL'); 

// Verificação de configuração: o Stripe requer a chave secreta
if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SERVICE_ROLE_KEY || !SITE_URL) {
    console.error('ERRO CRÍTICO: Variáveis de ambiente Supabase/Stripe faltando.');
    serve(() => new Response("Configuração do servidor faltando.", { status: 500 }));
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

// Inicializa Stripe com a chave segura lida do ambiente
const stripe = new Stripe(STRIPE_SECRET_KEY); 

serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }
  try {
    // 1. Autentica e pega o usuário logado (usa Anon Key e URL)
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");
    
    // 2. Cria o admin client (usa Service Role Key e URL)
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // 3. Pega o ID de cliente do Stripe salvo no seu banco
    const { data: subData, error: subError } = await supabaseAdmin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single();
    if (subError || !subData?.stripe_customer_id) {
      throw new Error(`Não foi possível encontrar Stripe Customer ID para o user: ${user.id}. Erro: ${subError ? subError.message : 'ID não encontrado.'}`);
    }
    const { stripe_customer_id } = subData;
    
    // 4. Cria a sessão do Portal do Cliente Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripe_customer_id,
      return_url: `${SITE_URL}/sistema` // Usa a URL limpa
    });
    
    // 5. Retorna a URL do portal
    return new Response(JSON.stringify({
      portalUrl: portalSession.url
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
    
  } catch (error) {
    console.error("ERRO CRÍTICO NA FUNÇÃO: " + error.message);
    // Retorna 500 para o frontend
    return new Response(JSON.stringify({
      error: "Erro interno. Por favor, verifique os logs da função no Supabase."
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});