import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const dbUrl = Deno.env.get("TREASURY_DB_URL");
    if (!dbUrl) {
      return new Response("Missing TREASURY_DB_URL", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const url = new URL(req.url);

    // Intentamos leer de querystring
    let clientCode: string | null = url.searchParams.get("client_code");
    let fromDate: string | null = url.searchParams.get("from");
    let toDate: string | null = url.searchParams.get("to");

    // Intentamos leer del body (invoke)
    if (req.method !== "GET") {
      const rawBody = await req.text();
      if (rawBody) {
        try {
          const body = JSON.parse(rawBody) as any;

          if (!clientCode) {
            clientCode = body?.client_code || body?.query?.client_code || null;
          }
          if (!fromDate) {
            fromDate = body?.from || body?.query?.from || null;
          }
          if (!toDate) {
            toDate = body?.to || body?.query?.to || null;
          }
        } catch {}
      }
    }

    const client = new Client(dbUrl);
    await client.connect();

    // Query con SUM para agrupar por cliente + fecha
    let text = `
      select
        client_code,
        snapshot_date,
        sum(balance) as balance,
        max(currency) as currency
      from erp_core.v_treasury_timeseries
      where 1 = 1
    `;

    const args: unknown[] = [];
    let idx = 1;

    if (clientCode) {
      text += ` and client_code = $${idx++}`;
      args.push(clientCode);
    }
    if (fromDate) {
      text += ` and snapshot_date >= $${idx++}`;
      args.push(fromDate);
    }
    if (toDate) {
      text += ` and snapshot_date <= $${idx++}`;
      args.push(toDate);
    }

    text += `
      group by client_code, snapshot_date
      order by snapshot_date asc, client_code;
    `;

    const result = await client.queryObject<{
      client_code: string;
      snapshot_date: string;
      balance: string;
      currency: string;
    }>({ text, args });

    await client.end();

    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
