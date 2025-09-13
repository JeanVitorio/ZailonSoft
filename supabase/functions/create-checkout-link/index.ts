// supabase/functions/create-checkout-link/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Cria um cliente Supabase autenticado usando o token do usuário
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 2. Pega os dados do usuário logado a partir do token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError) throw userError

    // 3. Busca o nome da loja para usar na descrição do pagamento
    const { data: loja, error: lojaError } = await supabaseClient
      .from('lojas')
      .select('nome')
      .eq('user_id', user.id)
      .single()
    if (lojaError) throw new Error("Loja do usuário não encontrada.");


    // 4. Monta a requisição para o Mercado Pago
    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
    const MERCADO_PAGO_PLAN_ID = Deno.env.get('MERCADO_PAGO_PLAN_ID')
    const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

    if (!MERCADO_PAGO_ACCESS_TOKEN || !MERCADO_PAGO_PLAN_ID) {
      throw new Error('Variáveis de ambiente do Mercado Pago não configuradas.')
    }

    const requestBody = {
      preapproval_plan_id: MERCADO_PAGO_PLAN_ID,
      reason: `Assinatura ZailonSoft - ${loja.nome}`,
      external_reference: user.id,
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${SITE_URL}/sistema`,
        failure: `${SITE_URL}/assinar`,
        pending: `${SITE_URL}/assinar`,
      },
    }

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!mercadoPagoResponse.ok) {
      const errorBody = await mercadoPagoResponse.json()
      throw new Error(`Falha ao criar assinatura no Mercado Pago: ${errorBody.message || 'Erro desconhecido'}`)
    }

    const mercadoPagoData = await mercadoPagoResponse.json()
    const checkoutUrl = mercadoPagoData.init_point
    if (!checkoutUrl) {
      throw new Error('Falha ao obter URL de checkout do Mercado Pago.')
    }

    // 5. Retorna a URL de pagamento para o frontend
    return new Response(
      JSON.stringify({ success: true, checkoutUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})