// supabase/functions/mercadopago-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const notification = await req.json();

    // O webhook do Mercado Pago notifica o evento, mas precisamos buscar os detalhes
    if (notification.type === 'preapproval') {
      const subscriptionId = notification.data.id;
      const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

      const detailsResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        headers: { 'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` }
      });
      const subscriptionDetails = await detailsResponse.json();
      
      const userId = subscriptionDetails.external_reference;
      if (!userId) {
        return new Response("OK, mas sem external_reference.", { status: 200 });
      }

      let newStatus = '';
      // Status do Mercado Pago: authorized, paused, cancelled
      switch (subscriptionDetails.status) {
        case 'authorized':
          newStatus = 'active';
          break;
        case 'paused': // Pode acontecer se o pagamento falhar
          newStatus = 'payment_failed';
          break;
        case 'cancelled':
          newStatus = 'cancelled';
          break;
        default:
          return new Response("Status de assinatura não mapeado.", { status: 200 });
      }

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: newStatus, abacatepay_id: subscriptionId }) // reusando a coluna
        .eq('user_id', userId);

      if (error) throw error;
    }
    
    return new Response("Webhook processado", { status: 200 });

  } catch (error) {
    return new Response(`Erro no webhook: ${error.message}`, { status: 400 });
  }
});