// supabase/functions/start-subscription/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fullName, storeName, whatsapp, email, password } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Etapas do Supabase (sem alteração)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    if (authError) throw authError;
    if (!user) throw new Error("Falha ao criar usuário.");
    
    await supabaseAdmin.from('lojas').insert({
      user_id: user.id, proprietario: fullName, nome: storeName, whatsapp, email
    });
    
    await supabaseAdmin.from('subscriptions').insert({
      user_id: user.id, status: 'pending_payment'
    });

    // --- LÓGICA DO MERCADO PAGO ---
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
          payer_email: email,
          // URL para onde o cliente volta após pagar
          back_url: Deno.env.get('SITE_URL') ?? 'http://localhost:3000/sistema', 
          // Referência para sabermos de quem é a assinatura no webhook
          external_reference: user.id, 
        }),
    });

    if (!mercadoPagoResponse.ok) {
        const errorBody = await mercadoPagoResponse.json();
        throw new Error(`Erro ao criar assinatura no Mercado Pago: ${JSON.stringify(errorBody)}`);
    }

    const mercadoPagoData = await mercadoPagoResponse.json();
    // No Mercado Pago, o link de checkout se chama 'init_point'
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