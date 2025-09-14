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

    let userId, subscriptionData;

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

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        const subscription = event.data.object
        const customerId = subscription.customer

        const { data: userFromDb } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

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