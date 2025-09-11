// supabase/functions/create-stripe-checkout/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'npm:stripe'
import { corsHeaders } from '../_shared/cors.ts'

// Inicializa o cliente da Stripe com a chave secreta que está no Vault
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

serve(async (req) => {
  // Lida com a requisição preflight (padrão para CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Pega os dados do novo usuário vindos do formulário de cadastro
    const { fullName, storeName, whatsapp, email, password } = await req.json();

    // 2. Cria o admin client do Supabase para ter permissões elevadas
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3. Cria o usuário no sistema de Autenticação do Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    if (authError) throw authError;
    if (!user) throw new Error("Falha ao criar usuário na autenticação.");
    
    // 4. Cria a loja e a assinatura inicial (pendente) no banco de dados
    await supabaseAdmin.from('lojas').insert({
      user_id: user.id, proprietario: fullName, nome: storeName, whatsapp, email
    });
    await supabaseAdmin.from('subscriptions').insert({
      user_id: user.id, status: 'pending_payment'
    });

    // 5. Cria a Sessão de Checkout na Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: user.email,
      // Passa o ID do usuário do Supabase para a Stripe.
      // Isso é CRUCIAL para sabermos de quem é o pagamento no webhook.
      client_reference_id: user.id, 
      line_items: [
        {
          price: Deno.env.get('STRIPE_PRICE_ID')!, // Pega o ID do Plano do Vault
          quantity: 1,
        },
      ],
      // URLs para onde o cliente será redirecionado após o pagamento
      success_url: `${Deno.env.get('SITE_URL')}/sistema`,
      cancel_url: `${Deno.env.get('SITE_URL')}/signup`,
    });

    // 6. Retorna a URL de pagamento para o site
    return new Response(JSON.stringify({ checkoutUrl: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Se qualquer passo falhar, retorna um erro detalhado
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});