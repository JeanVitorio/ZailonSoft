// supabase/functions/start-subscription/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Tratamento da requisição preflight (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. EXTRAÇÃO E VALIDAÇÃO DOS DADOS DE ENTRADA
    const { fullName, storeName, whatsapp, email, password } = await req.json()
    console.log("start-subscription: Recebida nova tentativa de cadastro.");

    if (!fullName || !storeName || !whatsapp || !email || !password) {
      throw new Error('Todos os campos são obrigatórios.')
    }

    // 2. INICIALIZAÇÃO DO CLIENTE SUPABASE ADMIN
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    console.log("start-subscription: Cliente Supabase Admin inicializado.");

    // 3. CRIAÇÃO DO USUÁRIO NA AUTENTICAÇÃO
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirma o e-mail
      user_metadata: { full_name: fullName }
    })
    if (authError) throw new Error(`Falha ao criar usuário na autenticação: ${authError.message}`)
    if (!user) throw new Error("Usuário não foi retornado após a criação.");
    console.log(`start-subscription: Usuário criado com sucesso no Supabase Auth. User ID: ${user.id}`);

    // 4. CRIAÇÃO DOS REGISTROS NO BANCO DE DADOS
    const [lojaResult, subResult] = await Promise.all([
      supabaseAdmin.from('lojas').insert({ user_id: user.id, proprietario: fullName, nome: storeName, whatsapp: whatsapp, email }),
      supabaseAdmin.from('subscriptions').insert({ user_id: user.id, status: 'pending_payment' })
    ]);
    if (lojaResult.error) throw new Error(`Falha ao inserir loja no DB: ${lojaResult.error.message}`);
    if (subResult.error) throw new Error(`Falha ao inserir assinatura no DB: ${subResult.error.message}`);
    console.log("start-subscription: Registros 'lojas' e 'subscriptions' criados no banco de dados.");

    // 5. PREPARAÇÃO E CHAMADA PARA A API DO MERCADO PAGO
    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
    const MERCADO_PAGO_PLAN_ID = Deno.env.get('MERCADO_PAGO_PLAN_ID')
    const SITE_URL = Deno.env.get('SITE_URL')

    if (!MERCADO_PAGO_ACCESS_TOKEN || !MERCADO_PAGO_PLAN_ID || !SITE_URL) {
      throw new Error('As variáveis de ambiente MERCADO_PAGO_ACCESS_TOKEN, MERCADO_PAGO_PLAN_ID e SITE_URL são obrigatórias.')
    }
    console.log(`start-subscription: Usando PLAN_ID: ${MERCADO_PAGO_PLAN_ID.substring(0, 10)}...`);

    const requestBody = {
      preapproval_plan_id: MERCADO_PAGO_PLAN_ID,
      reason: `Assinatura ZailonSoft - ${storeName}`,
      external_reference: user.id,
      payer: {
        email: email,
      },
      back_urls: {
        success: `${SITE_URL}/sistema`,
        failure: `${SITE_URL}/assinar`,
        pending: `${SITE_URL}/assinar`,
      },
    }
    console.log("start-subscription: Enviando requisição para o Mercado Pago...");

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    // 6. TRATAMENTO DA RESPOSTA DO MERCADO PAGO
    if (!mercadoPagoResponse.ok) {
      const errorBody = await mercadoPagoResponse.json()
      console.error('ERRO DO MERCADO PAGO:', errorBody)
      throw new Error(`O Mercado Pago retornou um erro (${mercadoPagoResponse.status}): ${errorBody.message}. Verifique se seu PLAN_ID é válido para o ambiente de produção.`)
    }

    const mercadoPagoData = await mercadoPagoResponse.json()
    const checkoutUrl = mercadoPagoData.init_point
    if (!checkoutUrl) {
      throw new Error('Resposta do Mercado Pago não continha a URL de checkout (init_point).')
    }
    console.log("start-subscription: Sucesso! URL de checkout gerada.");

    // 7. RETORNO DE SUCESSO PARA O FRONTEND
    return new Response(
      JSON.stringify({ success: true, checkoutUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error("ERRO GERAL NA FUNÇÃO 'start-subscription':", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})