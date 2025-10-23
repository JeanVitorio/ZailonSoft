// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe'

// As chaves são lidas do ambiente (Secrets do Supabase)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')! // Seu Secret Custom
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const stripe = new Stripe(STRIPE_SECRET_KEY)

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  // 🚨 CORREÇÃO DE SEGURANÇA: Leitura do corpo RAW para evitar corrupção
  const rawBody = await req.arrayBuffer()
  const body = new TextDecoder().decode(rawBody) 

  try {
    // Usa o corpo STRING (limpo) para a verificação de assinatura
    const event = await stripe.webhooks.constructEventAsync(body, signature!, WEBHOOK_SECRET)
    
    // Cliente Admin criado com a SERVICE ROLE KEY (CUSTOM_SUPABASE_SERVICE_ROLE_KEY)
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Declarar variáveis aqui para escopo mais amplo
    let userId, subscriptionData, customerId, userFromDb, invoice, subscription;

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        userId = session.client_reference_id
        
        subscriptionData = {
          status: 'active',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        };
        
        await supabaseAdmin
          .from('subscriptions')
          .update(subscriptionData)
          .eq('user_id', userId)
        
        console.log(`Assinatura ativada para o usuário: ${userId}`);
        break;

      // Caso de falha de pagamento (renovação)
      case 'invoice.payment_failed':
        invoice = event.data.object;
        customerId = invoice.customer;
        
        ({ data: userFromDb } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single());
        
        if (userFromDb) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'unpaid' }) 
            .eq('user_id', userFromDb.user_id);
          console.log(`Falha no pagamento da fatura para usuário: ${userFromDb.user_id}, status definido como 'unpaid'`);
        }
        break;

      // 🚨 CORREÇÃO B: CASO CORRETO DE SUCESSO DE PAGAMENTO (invoice.paid)
      case 'invoice.paid': 
        invoice = event.data.object;
        customerId = invoice.customer;
        
        ({ data: userFromDb } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single());
        
        if (userFromDb) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'active' }) // Reativa a assinatura
            .eq('user_id', userFromDb.user_id);
          console.log(`Pagamento da fatura bem-sucedido para usuário: ${userFromDb.user_id}, status definido como 'active'`);
        }
        break;

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        subscription = event.data.object
        customerId = subscription.customer

        ({ data: userFromDb } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single())

        if (userFromDb) {
            await supabaseAdmin
            .from('subscriptions')
            .update({ status: subscription.status }) 
            .eq('user_id', userFromDb.user_id)
            
            console.log(`Assinatura do usuário ${userFromDb.user_id} atualizada para ${subscription.status}`);
        }
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    // Retorna 400 para o Stripe em caso de falha de segurança ou processamento
    console.warn(`⚠️ Erro no webhook da Stripe: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});