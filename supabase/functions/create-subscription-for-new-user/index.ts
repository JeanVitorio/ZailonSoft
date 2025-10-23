// supabase/functions/create-subscription-for-new-user/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe'; // 🚨 NOVO: Importa o Stripe

// -----------------------------------------------------------
// 1. Configuração e Inicialização
// -----------------------------------------------------------
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
// Use SUPABASE_SERVICE_ROLE_KEY, conforme seu código
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''; 
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

// Verificação de segurança (crucial)
if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
    console.error('ERRO CRÍTICO: Chaves secretas faltando.');
    Deno.serve(() => new Response("Configuração do servidor faltando.", { status: 500 }));
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const stripe = new Stripe(STRIPE_SECRET_KEY);

Deno.serve(async (req) => {
  try {
    const { record: user } = await req.json();
    
    if (!user || !user.id || !user.email) { 
      throw new Error('Dados do usuário (ID ou Email) inválidos no payload do trigger.');
    }

    // -----------------------------------------------------------
    // 2. CRIAÇÃO DO CLIENTE NO STRIPE
    // -----------------------------------------------------------
    
    // Cria um cliente Stripe usando o email do usuário
    const customer = await stripe.customers.create({
        email: user.email,
        name: user.email, // Usa o email como nome ou ajuste para o nome real se tiver
        metadata: {
            supabase_user_id: user.id // Para sincronizar de volta ao Supabase
        }
    });

    const stripeCustomerId = customer.id;
    console.log(`Cliente Stripe criado para ${user.email}: ${stripeCustomerId}`);


    // -----------------------------------------------------------
    // 3. INSERÇÃO NO SUPABASE COM O ID DO STRIPE
    // -----------------------------------------------------------

    const { error } = await supabaseAdmin.from('subscriptions').insert({
      user_id: user.id,
      status: 'pending_payment',
      stripe_customer_id: stripeCustomerId // 🚨 CORRIGIDO: Salvando o ID do Stripe
    });

    if (error) throw error;
    
    return new Response('Cliente Stripe e Assinatura inicial criados com sucesso.', {
      status: 200
    });
  } catch (error) {
    console.error('Erro ao criar assinatura:', error.message);
    return new Response(`Erro interno do servidor: ${error.message}`, {
      status: 500
    });
  }
});