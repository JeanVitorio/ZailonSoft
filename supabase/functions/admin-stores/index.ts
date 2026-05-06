// Edge Function: admin-stores
// Painel super-admin: criar/listar/editar lojas, criar usuário com login,
// definir status de assinatura e período de acesso.
// Protegido por header `x-admin-key` validado contra ADMIN_MASTER_KEY (secret).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-key",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const adminKey = req.headers.get("x-admin-key") || "";
  const expected = Deno.env.get("ADMIN_MASTER_KEY") || "";
  if (!expected || adminKey !== expected) {
    return json({ error: "Não autorizado" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: any = {};
  try {
    body = req.method === "POST" ? await req.json() : {};
  } catch {
    body = {};
  }
  const action = body.action || new URL(req.url).searchParams.get("action") || "list";

  try {
    if (action === "list") {
      const { data: lojas, error } = await supabase
        .from("lojas")
        .select("id, slug, nome, email, telefone_principal, user_id, logo_url, created_at");
      if (error) throw error;
      const userIds = (lojas || []).map((l: any) => l.user_id).filter(Boolean);
      let subs: any[] = [];
      if (userIds.length) {
        const { data: s } = await supabase
          .from("subscriptions")
          .select("user_id, status, current_period_end, plan")
          .in("user_id", userIds);
        subs = s || [];
      }
      const merged = (lojas || []).map((l: any) => {
        const sub = subs.find((s) => s.user_id === l.user_id);
        return { ...l, subscription: sub || null };
      });
      return json({ lojas: merged });
    }

    if (action === "create") {
      const { email, password, store_name, slug, phone, owner_name, access_days, status, logo_url, descricao, site, whatsapp, horario_funcionamento, localizacao, redes_sociais } = body;
      if (!email || !password || !store_name) {
        return json({ error: "Campos obrigatórios: email, password, store_name" }, 400);
      }
      const finalSlug = slug ? slugify(slug) : slugify(store_name);

      // 1) Cria usuário (auto-confirmado)
      const { data: created, error: uerr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { store_name },
      });
      if (uerr) return json({ error: `Erro criando usuário: ${uerr.message}` }, 400);
      const userId = created.user!.id;

      // 2) Cria loja
      const { data: loja, error: lerr } = await supabase
        .from("lojas")
        .insert({
          slug: finalSlug,
          nome: store_name,
          email,
          telefone_principal: phone || null,
          proprietario: owner_name || null,
          logo_url: logo_url || null,
          descricao: descricao || null,
          site: site || null,
          whatsapp: whatsapp || null,
          horario_funcionamento: horario_funcionamento || null,
          localizacao: localizacao || null,
          redes_sociais: redes_sociais || null,
          user_id: userId,
        })
        .select()
        .single();
      if (lerr) return json({ error: `Erro criando loja: ${lerr.message}` }, 400);

      // 3) Subscription
      const finalStatus = status || "active";
      let periodEnd: string | null = null;
      if (access_days && access_days !== "full") {
        const days = Number(access_days);
        if (!isNaN(days)) {
          const d = new Date();
          d.setDate(d.getDate() + days);
          periodEnd = d.toISOString();
        }
      }
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          status: finalStatus,
          plan: access_days === "full" ? "full" : `${access_days || "custom"}_dias`,
          current_period_end: periodEnd,
        },
        { onConflict: "user_id" },
      );

      return json({ ok: true, loja, user_id: userId });
    }

    if (action === "update_subscription") {
      const { user_id, status, access_days } = body;
      if (!user_id) return json({ error: "user_id obrigatório" }, 400);
      let periodEnd: string | null = null;
      if (access_days && access_days !== "full") {
        const days = Number(access_days);
        if (!isNaN(days)) {
          const d = new Date();
          d.setDate(d.getDate() + days);
          periodEnd = d.toISOString();
        }
      }
      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id,
          status: status || "active",
          plan: access_days === "full" ? "full" : `${access_days || "custom"}_dias`,
          current_period_end: periodEnd,
        },
        { onConflict: "user_id" },
      );
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "update_loja") {
      const { id, ...updates } = body.loja || body;
      if (!id) return json({ error: "id obrigatório" }, 400);
      const { error } = await supabase.from("lojas").update(updates).eq("id", id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === "delete") {
      const { loja_id, user_id } = body;
      if (loja_id) await supabase.from("lojas").delete().eq("id", loja_id);
      if (user_id) {
        await supabase.from("subscriptions").delete().eq("user_id", user_id);
        await supabase.auth.admin.deleteUser(user_id);
      }
      return json({ ok: true });
    }

    if (action === "reset_password") {
      const { user_id, new_password } = body;
      if (!user_id || !new_password) return json({ error: "user_id e new_password" }, 400);
      const { error } = await supabase.auth.admin.updateUserById(user_id, {
        password: new_password,
      });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (e: any) {
    return json({ error: e.message || "Erro interno" }, 500);
  }
});
