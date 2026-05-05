// Edge Function: signup-store
// Criação pública de conta + loja (chamada da tela de login)
// Cria usuário, loja vinculada, e assinatura inicial em "trial" (pending_payment até super-admin liberar).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { email, password, store_name, phone, owner_name } = await req.json();
    if (!email || !password || !store_name) {
      return json({ error: "Campos obrigatórios: email, password, store_name" }, 400);
    }
    if (password.length < 6) return json({ error: "Senha deve ter no mínimo 6 caracteres." }, 400);

    // Slug único
    let baseSlug = slugify(store_name) || `loja-${Date.now()}`;
    let slug = baseSlug;
    let i = 1;
    while (true) {
      const { data: exists } = await supabase.from("lojas").select("id").eq("slug", slug).maybeSingle();
      if (!exists) break;
      slug = `${baseSlug}-${i++}`;
      if (i > 50) break;
    }

    const { data: created, error: uerr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { store_name },
    });
    if (uerr) return json({ error: uerr.message }, 400);
    const userId = created.user!.id;

    const { data: loja, error: lerr } = await supabase
      .from("lojas")
      .insert({
        slug,
        nome: store_name,
        email,
        telefone_principal: phone || null,
        proprietario: owner_name || null,
        user_id: userId,
      })
      .select()
      .single();
    if (lerr) {
      await supabase.auth.admin.deleteUser(userId);
      return json({ error: lerr.message }, 400);
    }

    // Assinatura inicial — pendente até liberação manual pelo super-admin
    await supabase.from("subscriptions").upsert(
      { user_id: userId, status: "pending_payment", plan: "trial" },
      { onConflict: "user_id" },
    );

    return json({ ok: true, slug, loja_id: loja.id });
  } catch (e: any) {
    return json({ error: e.message || "Erro interno" }, 500);
  }
});
