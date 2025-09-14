// supabase/functions/start-subscription/index.ts

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
    const { fullName, storeName, whatsapp, email, password } = await req.json()
    if (!fullName || !storeName || !whatsapp || !email || !password) {
      throw new Error('Todos os campos são obrigatórios.')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('CUSTOM_SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Cria o usuário na Autenticação do Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: fullName }
    })
    if (authError) throw authError
    if (!user) throw new Error("Falha ao criar usuário na autenticação.");
    
    // 2. Cria a loja e a assinatura inicial (pendente) no banco de dados
    await supabaseAdmin.from('lojas').insert({
      user_id: user.id, proprietario: fullName, nome: storeName, whatsapp, email
    });
    await supabaseAdmin.from('subscriptions').insert({
      user_id: user.id, status: 'pending_payment'
    });

    // 3. Cria a Sessão de Checkout na Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      // Passa o ID do usuário do Supabase para a Stripe. Crucial para o webhook.
      client_reference_id: user.id, 
      line_items: [{
          price: Deno.env.get('STRIPE_PRICE_ID')!,
          quantity: 1,
      }],
      success_url: `${Deno.env.get('SITE_URL')}/sistema`,
      cancel_url: `${Deno.env.get('SITE_URL')}/assinar`,
    });

    // 4. Retorna a URL de pagamento para o site
    return new Response(JSON.stringify({ checkoutUrl: session.url }), {
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