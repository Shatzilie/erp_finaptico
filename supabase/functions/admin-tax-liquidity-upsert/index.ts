import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response("Missing env vars", { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response("Missing Authorization header", { status: 401 });
  }

  // 1) Validar JWT (usuario logado en Lovable)
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) {
    return new Response("Invalid token", { status: 401 });
  }

  const userId = userData.user.id;

  // 2) Service role (RLS A)
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: adminUser } = await adminClient
    .from("erp_core.admin_users")
    .select("user_id, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (!adminUser || adminUser.is_active !== true) {
    return new Response("Forbidden", { status: 403 });
  }

  // 3) Body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const {
    client_code,
    instance_code,
    tax_type,
    tax_model,
    tax_period,
    amount_paid,
    payment_date,
    notes,
  } = body;

  if (
    !client_code ||
    !tax_type ||
    !tax_model ||
    !tax_period ||
    amount_paid === undefined ||
    !payment_date
  ) {
    return new Response("Missing required fields", { status: 400 });
  }

  const amount = Math.round(Number(amount_paid) * 100) / 100;
  if (isNaN(amount) || amount < 0) {
    return new Response("Invalid amount_paid", { status: 400 });
  }

  // 4) Upsert (1 pago por modelo + periodo)
  const { error } = await adminClient
    .from("erp_core.tax_liquidations")
    .upsert(
      {
        client_code,
        instance_code: instance_code ?? null,
        tax_type,
        tax_model,
        tax_period,
        amount_paid: amount,
        currency: "EUR",
        payment_date,
        status: "paid",
        notes: notes ?? null,
      },
      { onConflict: "client_code,tax_model,tax_period" }
    );

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
