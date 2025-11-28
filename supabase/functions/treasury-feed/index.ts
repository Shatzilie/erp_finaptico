// supabase/functions/treasury-feed/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (_req) => {
  try {
    const url = Deno.env.get("SUPABASE_DB_URL");
    if (!url) {
      return new Response("Missing SUPABASE_DB_URL", { status: 500 });
    }

    const client = new Client(url);
    await client.connect();

    const result = await client.queryObject`
      select
        client_code,
        instance_code,
        snapshot_date,
        total_balance,
        currency
      from erp_core.v_treasury_client_totals
      order by snapshot_date desc, client_code, instance_code;
    `;

    await client.end();

    return new Response(JSON.stringify(result.rows), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
    });
  }
});

import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
