// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'npm:stripe'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Inicializa o cliente da Stripe com a chave secreta
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

// Função principal que escuta os eventos da Stripe
serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')!
  const body = await req.text()
  
  // Verifica se o evento veio mesmo da Stripe
  let receivedEvent
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }

  // Cria o cliente admin do Supabase para poder alterar o banco
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    let userId: string | null = null;
    let stripeCustomerId: string | null = null;
    let stripeSubscriptionId: string | null = null;
    let newStatus: string | null = null;

    // Processa os eventos que nos interessam
    switch (receivedEvent.type) {
      case 'checkout.session.completed': {
        const checkoutSession = receivedEvent.data.object
        userId = checkoutSession.client_reference_id // ID do usuário do Supabase
        stripeCustomerId = checkoutSession.customer as string;
        stripeSubscriptionId = checkoutSession.subscription as string;
        newStatus = 'active'; // Assinatura ativada!
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = receivedEvent.data.object
        stripeCustomerId = invoice.customer as string;
        newStatus = 'payment_failed'; // Pagamento da mensalidade falhou
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = receivedEvent.data.object
        stripeCustomerId = subscription.customer as string;
        newStatus = 'cancelled'; // Cliente cancelou
        break;
      }
    }
    
    // Se o evento for de pagamento falho ou cancelamento, precisamos encontrar o userId
    if (!userId && stripeCustomerId) {
      const { data } = await supabaseAdmin.from('subscriptions').select('user_id').eq('stripe_customer_id', stripeCustomerId).single()
      if (data) {
        userId = data.user_id;
      }
    }

    // Se encontramos um usuário e um novo status, atualizamos o banco de dados
    if (userId && newStatus) {
      const updateData: { status: string; stripe_customer_id?: string; stripe_subscription_id?: string } = {
        status: newStatus,
      };
      
      // Se for a primeira vez (checkout), salvamos os IDs da Stripe
      if (stripeCustomerId) updateData.stripe_customer_id = stripeCustomerId;
      if (stripeSubscriptionId) updateData.stripe_subscription_id = stripeSubscriptionId;

      const { error } = await supabaseAdmin.from('subscriptions').update(updateData).eq('user_id', userId)
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
});