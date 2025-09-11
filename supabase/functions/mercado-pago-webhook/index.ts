// supabase/functions/mercado-pago-webhook/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Mapeia os status do Mercado Pago para os status que você usa no seu banco
const statusMap: { [key: string]: string } = {
  'authorized': 'active',      // Pagamento aprovado -> assinatura ativa
  'paused': 'paused',        // Assinatura pausada
  'cancelled': 'cancelled',    // Assinatura cancelada
  'pending': 'pending_payment' // Ainda pendente
};

serve(async (req) => {
  // O Mercado Pago sempre envia uma requisição do tipo POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const notification = await req.json()
    console.log('Notificação do Mercado Pago recebida:', notification)

    // O webhook do MP envia apenas o ID. Precisamos consultar a API para obter os detalhes.
    // Verificamos se a notificação é do tipo 'preapproval' (assinatura) e tem um ID.
    if (notification.topic === 'preapproval' && notification.resource) {
      // O resource contém a URL completa, ex: "https://api.mercadopago.com/preapproval/2c938084..."
      const preapprovalUrl = notification.resource;

      // 1. Obter os detalhes da assinatura da API do Mercado Pago
      const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
      if (!MERCADO_PAGO_ACCESS_TOKEN) {
        throw new Error("A variável de ambiente MERCADO_PAGO_ACCESS_TOKEN não está configurada.")
      }

      const mpResponse = await fetch(preapprovalUrl, {
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
        }
      })

      if (!mpResponse.ok) {
        throw new Error(`Erro ao buscar dados no Mercado Pago: ${mpResponse.statusText}`)
      }

      const preapprovalDetails = await mpResponse.json()
      console.log('Detalhes da assinatura:', preapprovalDetails)

      const userId = preapprovalDetails.external_reference // Nosso ID de usuário do Supabase!
      const mpStatus = preapprovalDetails.status
      const newStatus = statusMap[mpStatus] || 'unknown'; // Mapeia o status para um conhecido

      if (!userId) {
        throw new Error("external_reference (ID do usuário) não foi encontrado na assinatura.")
      }
      
      if (newStatus === 'unknown') {
        console.warn(`Status do Mercado Pago não mapeado: ${mpStatus}`);
        return new Response(JSON.stringify({ ok: true, message: "Status não mapeado, ignorado." }), { status: 200 });
      }

      // 2. Atualizar o banco de dados do Supabase
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const updateData = {
        status: newStatus,
        abacatepay_id: preapprovalDetails.id // Salvando o ID da assinatura do MP no campo existente
      };

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', userId)

      if (error) throw error;
      console.log(`Assinatura do usuário ${userId} atualizada para o status: ${newStatus}`);
    }

    // Responda ao Mercado Pago com status 200 para confirmar o recebimento
    return new Response(JSON.stringify({ ok: true }), { status: 200 })

  } catch (error) {
    console.error('Erro no processamento do webhook:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})