// supabase/functions/treasury-feed/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const dbUrl = Deno.env.get("TREASURY_DB_URL");

    if (!dbUrl) {
      return new Response("Missing TREASURY_DB_URL", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Leer parámetro opcional ?client_code=CLIENT_001
    const url = new URL(req.url);
    const clientCode = url.searchParams.get("client_code") ?? null;

    const client = new Client(dbUrl);
    await client.connect();

    // Construimos la query con filtro opcional por client_code
    let text = `
      select
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
      order by snapshot_date desc, client_code, instance_code;
    `;

    const result = await client.queryObject<{
      client_code: string;
      instance_code: string;
      snapshot_date: string;
      total_balance: number;
      currency: string;
    }>({ text, args });

    await client.end();

    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
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
  }
});
// prueba workflow actualizar Edge functions en automatico en supabase
