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
  snapshot_date: string; // formato 'YYYY-MM-DD'
  total_balance: number;
  currency: string;
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

    // 1) Leer todos los snapshots de la vista (histórico)
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

    const result = await client.queryObject<TreasuryRow>({ text, args });
    await client.end();

    const rows = result.rows ?? [];

    // 2) Quedarnos solo con el último snapshot por (client_code, instance_code)
    const latestByKey = new Map<string, TreasuryRow>();

    for (const row of rows) {
      const key = `${row.client_code}__${row.instance_code}`;
      const existing = latestByKey.get(key);

      // snapshot_date es 'YYYY-MM-DD', así que la comparación de string funciona
      if (!existing || row.snapshot_date > existing.snapshot_date) {
        latestByKey.set(key, row);
      }
    }

    const latestRows = Array.from(latestByKey.values()).sort((a, b) => {
      if (a.client_code === b.client_code) {
        // ordenar por instancia y fecha descendente por si hay empate visual
        if (a.instance_code === b.instance_code) {
          return a.snapshot_date < b.snapshot_date ? 1 : -1;
        }
        return a.instance_code.localeCompare(b.instance_code);
      }
      return a.client_code.localeCompare(b.client_code);
    });

    return new Response(JSON.stringify(latestRows), {
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
// prueba workflow actualizar Edge functions en automatico en supabase prueba 2
