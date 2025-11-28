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

    // 1) Intentamos leer de querystring
    let clientCode: string | null = url.searchParams.get("client_code");
    let fromDate: string | null = url.searchParams.get("from");
    let toDate: string | null = url.searchParams.get("to");

    // 2) Si no viene en query, intentamos leer del body (supabase.functions.invoke)
    if (req.method !== "GET") {
      const rawBody = await req.text();
      if (rawBody) {
        try {
          const body = JSON.parse(rawBody) as any;

          // puede venir como { client_code } o como { query: { client_code } }
          if (!clientCode) {
            if (typeof body?.client_code === "string") {
              clientCode = body.client_code;
            } else if (typeof body?.query?.client_code === "string") {
              clientCode = body.query.client_code;
            }
          }

          if (!fromDate) {
            if (typeof body?.from === "string") {
              fromDate = body.from;
            } else if (typeof body?.query?.from === "string") {
              fromDate = body.query.from;
            }
          }

          if (!toDate) {
            if (typeof body?.to === "string") {
              toDate = body.to;
            } else if (typeof body?.query?.to === "string") {
              toDate = body.query.to;
            }
          }
        } catch {
          // body vacío o JSON no válido: ignoramos y seguimos solo con querystring
        }
      }
    }

    const client = new Client(dbUrl);
    await client.connect();

    let text = `
      select
        client_code,
        instance_code,
        snapshot_date,
        balance,
        currency
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

    text += ` order by snapshot_date asc, client_code, instance_code;`;

    const result = await client.queryObject<{
      client_code: string;
      instance_code: string;
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
