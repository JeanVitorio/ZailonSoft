// supabase/functions/create-checkout-link/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Pega o usuário autenticado a partir do token enviado pelo frontend
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Usuário não encontrado. Faça login novamente.");

    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    const MERCADO_PAGO_PLAN_ID = Deno.env.get('MERCADO_PAGO_PLAN_ID');

    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preapproval_plan_id: MERCADO_PAGO_PLAN_ID,
          payer_email: user.email,
          back_url: `${Deno.env.get('SITE_URL')}/sistema`,
          external_reference: user.id,
        }),
    });

    if (!mercadoPagoResponse.ok) {
        const errorBody = await mercadoPagoResponse.json();
        throw new Error(`Erro no Mercado Pago: ${JSON.stringify(errorBody)}`);
    }

    const mercadoPagoData = await mercadoPagoResponse.json();
    const checkoutUrl = mercadoPagoData.init_point;

    return new Response(JSON.stringify({ checkoutUrl }), {
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