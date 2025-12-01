// supabase/functions/tax-events-feed/index.ts

// Edge Function: tax-events-feed
// - Devuelve los eventos fiscales de un cliente para el calendario interno
// - Respeta RLS (usa el JWT del usuario)
// - Filtro por client_id y rango de fechas opcional

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Tipos básicos (solo lo necesario para el front del calendario)
type PeriodType = "monthly" | "quarterly" | "annual" | "one_off" | "custom";

type TaxEventStatus = "planned" | "done" | "postponed" | "cancelled";

interface ClientTaxEventRow {
  id: string;
  client_id: string;
  code: string;
  title: string;
  description: string | null;
  admin_notes: string | null;
  event_date: string; // date
  due_date: string | null; // date
  period_start: string | null; // date
  period_end: string | null; // date
  period_type: PeriodType | null;
  model_code: string | null;
  authority: string | null;
  status: TaxEventStatus;
  is_mandatory: boolean;
  is_visible_in_calendar: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
}

interface CalendarTaxEvent {
  id: string;
  clientId: string;
  title: string;
  subtitle: string | null;
  eventDate: string; // ISO date (YYYY-MM-DD)
  dueDate: string | null;
  period: {
    type: PeriodType | null;
    start: string | null;
    end: string | null;
  };
  status: TaxEventStatus;
  modelCode: string | null;
  authority: string | null;
  flags: {
    isMandatory: boolean;
    isVisibleInCalendar: boolean;
  };
}

interface TaxEventsFeedResponse {
  events: CalendarTaxEvent[];
}

// Utilidad CORS básica (igual patrón que en otras funciones)
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("CORS_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-id, x-requested-with, x-lovable-secret, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

serve(async (req: Request): Promise<Response> => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const url = new URL(req.url);
  const clientId = url.searchParams.get("client_id");
  const from = url.searchParams.get("from"); // YYYY-MM-DD opcional
  const to = url.searchParams.get("to"); // YYYY-MM-DD opcional

  if (!clientId) {
    return jsonResponse(
      { error: "Missing required parameter: client_id" },
      400,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse(
      { error: "Supabase environment variables not set" },
      500,
    );
  }

  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, 401);
  }

  // El JWT del usuario va en el header; RLS se apoya en él.
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  try {
    let query = supabase
      .from("client_tax_events")
      .select("*")
      .eq("client_id", clientId)
      .eq("is_visible_in_calendar", true)
      .order("event_date", { ascending: true });

    if (from) {
      query = query.gte("event_date", from);
    }
    if (to) {
      query = query.lte("event_date", to);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[tax-events-feed] DB error:", error);
      return jsonResponse(
        { error: "Database error", details: error.message },
        500,
      );
    }

    const rows = (data ?? []) as ClientTaxEventRow[];

    const events: CalendarTaxEvent[] = rows.map((row) => {
      // Subtítulo compacto para el calendario (modelo + periodo)
      const modelPart = row.model_code ? `Modelo ${row.model_code}` : null;

      let periodPart: string | null = null;
      if (row.period_type) {
        const label =
          row.period_type === "monthly"
            ? "Mensual"
            : row.period_type === "quarterly"
            ? "Trimestral"
            : row.period_type === "annual"
            ? "Anual"
            : row.period_type === "one_off"
            ? "Puntual"
            : "Personalizado";

        if (row.period_start && row.period_end) {
          periodPart = `${label} (${row.period_start} → ${row.period_end})`;
        } else {
          periodPart = label;
        }
      }

      const subtitleParts = [modelPart, periodPart].filter(Boolean);
      const subtitle = subtitleParts.length > 0
        ? subtitleParts.join(" · ")
        : null;

      return {
        id: row.id,
        clientId: row.client_id,
        title: row.title,
        subtitle,
        eventDate: row.event_date,
        dueDate: row.due_date,
        period: {
          type: row.period_type,
          start: row.period_start,
          end: row.period_end,
        },
        status: row.status,
        modelCode: row.model_code,
        authority: row.authority,
        flags: {
          isMandatory: row.is_mandatory,
          isVisibleInCalendar: row.is_visible_in_calendar,
        },
      };
    });

    const responseBody: TaxEventsFeedResponse = { events };

    return jsonResponse(responseBody, 200);
  } catch (e) {
    console.error("[tax-events-feed] Unexpected error:", e);
    return jsonResponse(
      { error: "Unexpected error", details: String(e) },
      500,
    );
  }
});
