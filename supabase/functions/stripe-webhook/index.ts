// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()

  try {
    const event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret)
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')!
    );

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

      // --- [NOVO] CASO DE FALHA NO PAGAMENTO DA RENOVAÇÃO ---
      case 'invoice.payment_failed':
        invoice = event.data.object;
        customerId = invoice.customer;
        
        // Encontra o usuário no seu DB pelo customerId do Stripe
        ({ data: userFromDb } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single());
        
        if (userFromDb) {
          // Atualiza o status no SEU banco para 'unpaid'
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'unpaid' }) // <-- O usuário será bloqueado no próximo login
            .eq('user_id', userFromDb.user_id);
          console.log(`Falha no pagamento da fatura para usuário: ${userFromDb.user_id}, status definido como 'unpaid'`);
        }
        break;

      // --- [NOVO] CASO DE SUCESSO EM PAGAMENTO (EX: PAGOU FATURA ATRASADA) ---
      case 'invoice.payment_succeeded':
        invoice = event.data.object;
        customerId = invoice.customer;
        
        // Encontra o usuário
        ({ data: userFromDb } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single());
        
        if (userFromDb) {
          // Reativa a assinatura
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'active' }) // <-- O usuário é liberado
            .eq('user_id', userFromDb.user_id);
          console.log(`Pagamento da fatura bem-sucedido para usuário: ${userFromDb.user_id}, status definido como 'active'`);
        }
        break;

      // --- FIM DOS NOVOS CASOS ---

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
            .update({ status: subscription.status }) // ex: 'canceled', 'unpaid'
            .eq('user_id', userFromDb.user_id)
            
            console.log(`Assinatura do usuário ${userFromDb.user_id} atualizada para ${subscription.status}`);
        }
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    console.warn(`⚠️ Erro no webhook da Stripe: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});