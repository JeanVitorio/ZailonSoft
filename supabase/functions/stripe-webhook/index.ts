// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe'

// ------------------------------------------------------------------
// 1. CARREGAMENTO E VERIFICAÇÃO DAS VARIÁVEIS DE AMBIENTE
// ------------------------------------------------------------------
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')! // Seu Secret Custom
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// Verificação de configuração: Este é um fallback de segurança
if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY || !WEBHOOK_SECRET) {
    console.error('ERRO CRÍTICO: Configurações de chaves secretas faltando.');
    serve(() => new Response("Configuração do servidor faltando.", { status: 500 }));
}

// Inicializa o Stripe e o Cliente Admin
const stripe = new Stripe(STRIPE_SECRET_KEY)
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  // 🚨 Corrigido o erro de assinatura: Leitura do corpo RAW
  const rawBody = await req.arrayBuffer()
  const body = new TextDecoder().decode(rawBody) 

  try {
    // Verificação de assinatura (agora deve funcionar com 200 OK)
    const event = await stripe.webhooks.constructEventAsync(body, signature!, WEBHOOK_SECRET)
    
    let userId, subscriptionData, customerId, userFromDb, invoice, subscription;

    switch (event.type) {
      case 'checkout.session.completed':
            // ... (Lógica de checkout deixada inalterada)
        break;

      case 'invoice.payment_failed':
            // ... (Lógica de payment_failed deixada inalterada)
        break;

      // ✅ CORREÇÃO FINAL DE LÓGICA: Atualiza status para 'active'
      case 'invoice.paid': 
        invoice = event.data.object;
        customerId = invoice.customer;
        
        // 1. Tenta encontrar o usuário pelo customerId
        const { data: subData, error: subSearchError } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        // 🚨 NOVO: Loga o erro de busca, se houver, para depuração
        if (subSearchError && subSearchError.code !== 'PGRST116') { // PGRST116 é "No rows found"
            console.error(`ERRO DB BUSCA: Falha ao buscar user para customer ${customerId}. Erro: ${subSearchError.message}`);
        }
        
        if (subData) {
          // 2. Atualiza o status
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'active' }) // Reativa a assinatura
            .eq('user_id', subData.user_id);
          
             // 🚨 NOVO: Loga o erro de atualização, se houver
             if (updateError) {
                console.error(`ERRO DB UPDATE: Falha ao atualizar status para user ${subData.user_id}. Erro: ${updateError.message}`);
             } else {
                console.log(`✅ SUCESSO: Pagamento da fatura BEM-SUCEDIDO para usuário: ${subData.user_id}, status definido como 'active'`);
             }
        } else {
            console.warn(`AVISO: Webhook recebido, mas Stripe Customer ID '${customerId}' não encontrado na tabela 'subscriptions'.`);
        }
        break;

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
            // ... (Lógica de atualização/deleção deixada inalterada)
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    console.warn(`⚠️ ERRO FINAL NO WEBHOOK: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});