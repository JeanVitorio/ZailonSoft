// supabase/functions/start-subscription/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { fullName, storeName, whatsapp, email, password } = await req.json()

    // Validação de entrada: Campos obrigatórios
    if (!fullName || !storeName || !whatsapp || !email || !password) {
      throw new Error('Todos os campos obrigatórios devem ser fornecidos: fullName, storeName, whatsapp, email, password')
    }

    // Validação básica de e-mail (formato simples)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('E-mail inválido. Forneça um e-mail válido.')
    }

    console.log('Dados recebidos:', { fullName, storeName, whatsapp, email: email.substring(0, 3) + '***' }) // Log parcial do e-mail por segurança

    // Inicializar cliente Supabase com service role key (bypass RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Passo 1: Criar usuário no Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirma o e-mail automaticamente
      user_metadata: { full_name: fullName }
    })

    if (authError || !user) {
      console.error('Erro ao criar usuário:', authError)
      throw new Error(`Falha ao criar usuário: ${authError?.message || 'Usuário não criado'}`)
    }

    console.log('Usuário criado com sucesso:', { userId: user.id, email: user.email })

    // Passo 2: Inserir loja na tabela 'lojas'
    const { error: insertLojaError } = await supabaseAdmin
      .from('lojas')
      .insert({
        user_id: user.id,
        proprietario: fullName,
        nome: storeName,
        telefone_principal: whatsapp, // Assumindo que whatsapp é o telefone principal
        email
      })

    if (insertLojaError) {
      console.error('Erro ao inserir loja:', insertLojaError)
      throw new Error(`Falha ao inserir loja: ${insertLojaError.message}`)
    }

    console.log('Loja inserida com sucesso para user_id:', user.id)

    // Passo 3: Inserir assinatura pendente na tabela 'subscriptions'
    const { error: insertSubError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: user.id,
        status: 'pending_payment',
        abacatepay_id: null // Será atualizado pelo webhook após aprovação
      })

    if (insertSubError) {
      console.error('Erro ao inserir assinatura:', insertSubError)
      throw new Error(`Falha ao inserir assinatura: ${insertSubError.message}`)
    }

    console.log('Assinatura pendente inserida para user_id:', user.id)

    // Passo 4: Lógica do Mercado Pago - Criar assinatura
    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
    const MERCADO_PAGO_PLAN_ID = Deno.env.get('MERCADO_PAGO_PLAN_ID')
    const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:3000'

    // Verificar variáveis de ambiente
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error('Variável de ambiente MERCADO_PAGO_ACCESS_TOKEN não configurada')
    }
    if (!MERCADO_PAGO_PLAN_ID) {
      throw new Error('Variável de ambiente MERCADO_PAGO_PLAN_ID não configurada. Crie um plano no painel do Mercado Pago.')
    }
    if (!SITE_URL) {
      throw new Error('Variável de ambiente SITE_URL não configurada')
    }

    // Corpo da requisição para Mercado Pago (baseado na doc oficial)
    const requestBody = {
      preapproval_plan_id: MERCADO_PAGO_PLAN_ID, // ID do plano de assinatura (obrigatório para recorrência)
      payer_email: email, // E-mail do pagador (obrigatório)
      reason: `Assinatura para ${storeName}`, // Descrição opcional, mas recomendada
      external_reference: user.id, // Referência externa para sincronizar com webhook
      back_url: `${SITE_URL}/sistema` // URL de retorno após checkout
      // Nota: Campos como card_token_id ou auto_recurring não são necessários aqui; o checkout do Mercado Pago gerencia o pagamento
    }

    console.log('Enviando requisição para Mercado Pago:', {
      ...requestBody,
      payer_email: email.substring(0, 3) + '***' // Log parcial por segurança
    })

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    // Verificar resposta do Mercado Pago
    if (!mercadoPagoResponse.ok) {
      const errorBody = await mercadoPagoResponse.json().catch(() => ({ message: 'Erro desconhecido' }))
      console.error('Erro do Mercado Pago (status:', mercadoPagoResponse.status, '):', errorBody)

      // Erros comuns:
      if (mercadoPagoResponse.status === 401) {
        throw new Error(`Unauthorized (401): Verifique o MERCADO_PAGO_ACCESS_TOKEN. Use token de teste no sandbox. Detalhes: ${JSON.stringify(errorBody)}`)
      } else if (mercadoPagoResponse.status === 400) {
        throw new Error(`Bad Request (400): Verifique o payer_email ou preapproval_plan_id. Use e-mail de teste. Detalhes: ${JSON.stringify(errorBody)}`)
      } else {
        throw new Error(`Erro no Mercado Pago (${mercadoPagoResponse.status}): ${JSON.stringify(errorBody)}`)
      }
    }

    const mercadoPagoData = await mercadoPagoResponse.json()
    console.log('Resposta do Mercado Pago:', { id: mercadoPagoData.id, status: mercadoPagoData.status, init_point: mercadoPagoData.init_point ? 'URL gerada' : 'N/A' })

    // Extrair URL de checkout (init_point)
    const checkoutUrl = mercadoPagoData.init_point
    if (!checkoutUrl) {
      throw new Error('Falha ao obter URL de checkout do Mercado Pago. Verifique o plano de assinatura.')
    }

    // Resposta de sucesso: Retorna a URL para o frontend redirecionar o usuário ao checkout
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário e assinatura criados. Redirecione para o checkout.',
        checkoutUrl 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Erro geral no start-subscription:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno no servidor' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})