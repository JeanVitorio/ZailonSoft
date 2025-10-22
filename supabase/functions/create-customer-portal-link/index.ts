// supabase/functions/create-customer-portal-link/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe'
import { corsHeaders } from '../_shared/cors.ts' // <-- Importação do arquivo compartilhado

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

serve(async (req) => {
  // 🚨 PASSO CRÍTICO: Responde imediatamente à requisição OPTIONS (preflight)
  // Deve usar os cabeçalhos importados do _shared/cors.ts
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // 1. Autentica e pega o usuário logado
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("Usuário não autenticado.");
    
    // 2. Cria o admin client do Supabase (para acessar dados de outras tabelas)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')! 
    );
    
    // 3. Pega o ID de cliente do Stripe salvo no seu banco (tabela subscriptions)
    const { data: subData, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (subError || !subData?.stripe_customer_id) {
      throw new Error("Não foi possível encontrar seu ID de cliente Stripe.");
    }
    
    const { stripe_customer_id } = subData;

    // 4. Cria a sessão do Portal do Cliente Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripe_customer_id,
      // Retorna para o sistema após o pagamento/atualização
      return_url: `${Deno.env.get('SITE_URL')}/sistema`, 
    });

    // 5. Retorna a URL do portal com os cabeçalhos CORS
    return new Response(JSON.stringify({ portalUrl: portalSession.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (error) {
    // Retorna erro com os cabeçalhos CORS
    return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
    });
  }
});