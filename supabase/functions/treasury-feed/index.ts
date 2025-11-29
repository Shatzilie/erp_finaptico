// supabase/functions/treasury-feed/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type TreasuryRow = {
  client_code: string;
  instance_code: string;
  snapshot_date: string; // 'YYYY-MM-DD'
  total_balance: string; // numeric en texto
  currency: string;
};

serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const dbUrl = Deno.env.get("TREASURY_DB_URL");

  if (!dbUrl) {
    return new Response("Missing TREASURY_DB_URL", {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Parámetro opcional ?client_code=CLIENT_001
  const url = new URL(req.url);
  const clientCode = url.searchParams.get("client_code") ?? null;

  const client = new Client(dbUrl);

  try {
    await client.connect();

    let text = `
      select distinct on (client_code, instance_code)
        client_code,
        instance_code,
        snapshot_date,
        total_balance,
        currency
      from erp_core.v_treasury_client_totals
    `;
    const args: unknown[] = [];

    if (clientCode) {
      text += ` where client_code = $1`;
      args.push(clientCode);
    }

    text += `
      order by client_code, instance_code, snapshot_date desc;
    `;

    const result = await client.queryObject<TreasuryRow>({ text, args });

    console.log(
      "[treasury-feed] rows returned",
      result.rows.length,
      "clientCode:",
      clientCode,
    );

    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[treasury-feed] error", error);

    return new Response(
      JSON.stringify({
        error: String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
});
// prueba workflow actualizar Edge functions en automatico en supabase prueba 2
