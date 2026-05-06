// Edge Function: submit-lead
// Recebe lead público (catálogo) ou interno e insere na tabela `clients`
// já vinculado à loja correta via slug. Não requer JWT (público).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, accept",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "false",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const optionsResponse = () => new Response(null, { status: 204, headers: corsHeaders });

interface SubmitLeadPayload {
  loja_slug?: string;
  loja_id?: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  age?: string | number;
  vehicle?: { id?: string; name?: string; price?: number };
  deal_type:
    | "a_vista"
    | "financiamento"
    | "troca"
    | "visita"
    | "consorcio"
    | "leasing"
    | string;
  // Por tipo
  cash_details?: { offered_value?: number; payment_window?: string };
  financing_details?: {
    down_payment?: number;
    installments?: number;
    monthly_income?: number;
  };
  trade_in?: {
    brand?: string;
    model?: string;
    year?: string;
    estimated_value?: number;
    difference_payment?: "cash" | "financing" | null;
    photos?: string[];
  };
  visit_details?: { day?: string; time?: string };
  consortium_details?: { letter_value?: number; term_months?: number };
  // Outros
  cnh_url?: string;
  source?: string;
  notes?: string;
  lgpd_consent?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const body: SubmitLeadPayload = await req.json();

    if (!body || !body.name || !body.phone || !body.deal_type) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: name, phone, deal_type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!body.loja_slug && !body.loja_id) {
      return new Response(
        JSON.stringify({ error: "É necessário informar loja_slug ou loja_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Resolve loja_id a partir do slug
    let lojaId = body.loja_id ?? null;
    if (!lojaId && body.loja_slug) {
      const { data: loja, error: lojaErr } = await supabase
        .from("lojas")
        .select("id")
        .eq("slug", body.loja_slug)
        .maybeSingle();
      if (lojaErr || !loja) {
        return new Response(JSON.stringify({ error: "Loja não encontrada" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      lojaId = loja.id;
    }

    // Monta payload de inserção
    const id = crypto.randomUUID();
    const chatId = `web_${id}`;
    const interestedVehicles = body.vehicle
      ? JSON.stringify([
          {
            id: body.vehicle.id ?? "",
            nome: body.vehicle.name ?? "",
            preco: body.vehicle.price ?? 0,
          },
        ])
      : "";

    const tradeInCar = body.trade_in
      ? JSON.stringify({
          brand: body.trade_in.brand ?? "",
          model: body.trade_in.model ?? "",
          year: body.trade_in.year ?? "",
          estimated_value: body.trade_in.estimated_value ?? 0,
          difference_payment: body.trade_in.difference_payment ?? null,
          photos: body.trade_in.photos ?? [],
        })
      : "";

    const financingDetails = body.financing_details
      ? JSON.stringify(body.financing_details)
      : "";

    const visitDetails = body.visit_details
      ? {
          day: body.visit_details.day ?? "",
          time: body.visit_details.time ?? "",
        }
      : null;

    // bot_data guarda blocos extras (cash, consorcio, cnh, lgpd)
    const botData = {
      cash_details: body.cash_details ?? null,
      consortium_details: body.consortium_details ?? null,
      cnh_url: body.cnh_url ?? null,
      lgpd_consent: !!body.lgpd_consent,
      age: body.age ?? null,
      submitted_at: new Date().toISOString(),
      source: body.source ?? "catalog",
      history: [
        {
          timestamp: new Date().toLocaleString("pt-BR"),
          updated_data: { state: "Lead criado via formulário" },
        },
      ],
    };

    const insertPayload: Record<string, any> = {
      id,
      chat_id: chatId,
      loja_id: lojaId,
      name: body.name,
      phone: body.phone,
      cpf: body.cpf ?? "",
      job: "",
      state: "novo",
      deal_type: body.deal_type,
      interested_vehicles: interestedVehicles,
      trade_in_car: tradeInCar,
      financing_details: financingDetails,
      visit_details: visitDetails,
      bot_data: botData,
      notes: body.notes ?? "",
      channel: body.source ?? "catalog",
      priority: "normal",
      documents: [],
      tags: [],
      follow_up_count: 0,
    };

    const { data, error } = await supabase
      .from("clients")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir lead:", error);
      return new Response(
        JSON.stringify({ error: "Falha ao salvar lead", details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ success: true, lead: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Erro inesperado:", err);
    return new Response(
      JSON.stringify({ error: "Erro inesperado", details: err?.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
