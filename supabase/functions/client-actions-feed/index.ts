// supabase/functions/client-actions-feed/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
    const clientCode = url.searchParams.get("client_id"); // ej: CLIENT_001

    const client = new Client(dbUrl);
    await client.connect();

    let text = `
      select
        client_id,
        title,
        description,
        status,
        priority,
        due_date,
        created_at,
        updated_at
      from erp_core.client_actions
      where status != 'done'
    `;
    const args: unknown[] = [];
    let idx = 1;

    if (clientCode) {
      text += ` and client_id = $${idx++}`;
      args.push(clientCode);
    }

    text += `
      order by due_date nulls last, priority desc, created_at asc;
    `;

    const result = await client.queryObject<{
      client_id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      due_date: string | null;
      created_at: string;
      updated_at: string;
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
      JSON.stringify({ error: String(error) }),
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
