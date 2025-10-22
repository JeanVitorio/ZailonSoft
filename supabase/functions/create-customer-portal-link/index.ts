// supabase/functions/create-customer-portal-link/index.ts
// ESTE CÓDIGO PRECISA SER PUBLICADO NO SUPABASE

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe'

// Define os cabeçalhos de CORS para permitir seu domínio LIVE e o localhost.
const corsHeaders = {
    // Permite Múltiplos Domínios (https://zailonsoft.com.br e http://localhost:8080)
    'Access-Control-Allow-Origin': 'https://zailonsoft.com.br, http://localhost:8080', 
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

serve(async (req) => {
    // 🚨 Responde imediatamente à requisição OPTIONS (preflight)
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
        
        // 2. Cria o admin client do Supabase (para acessar a tabela subscriptions)
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')! 
        );
        
        // 3. Pega o ID de cliente do Stripe salvo no seu banco
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

        // 5. Retorna a URL do portal
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