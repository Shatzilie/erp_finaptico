Contrato de datos Lovable (Finaptico) — Bloque “Resumen financiero” (solo lectura)

Reglas generales (aplican a todo):

Filtro siempre por client_code y instance_code.

Fechas acotadas. Nada de sumas históricas infinitas.

Los números ya vienen redondeados en vistas *_display.

Lovable no calcula KPIs. Solo muestra.

1) Card “Resumen financiero”

Dataset

erp_core.v_card_financial_summary

Grano

1 fila por (client_code, instance_code).

Campos

Identidad:

client_code (text)

instance_code (text)

Resultado operativo (último mes):

last_month (date) Mes último en la serie 12M

revenue_last_month (numeric, 2 dec) Ingresos del mes

operating_spend_last_month (numeric, 2 dec) Gasto operativo del mes (excluye DF)

operating_result_last_month (numeric, 2 dec) Resultado operativo neto del mes

operating_result_avg_3m_prev (numeric, 2 dec) Media 3 meses previos

operating_result_delta_vs_3m (numeric, 2 dec) Diferencia vs media 3M

operating_result_trend_status (text: up|down|flat|neutral)

operating_result_trend_label (text)

YTD:

period_start (date)

period_end (date)

revenue_ytd (numeric, 2 dec)

operating_spend_ytd (numeric, 2 dec)

operating_result_net_ytd (numeric, 2 dec)

Tesorería y runway (estado actual):

treasury_snapshot_date (date)

currency (text)

treasury_balance (numeric, 2 dec)

burn_operating_avg_3m (numeric, 2 dec)

runway_months (numeric, 1 dec)

runway_status (text: ok|watch|risk|neutral)

runway_label (text)

Uso en UI

Card principal: valores del último mes + runway + etiquetas.

Icono de tendencia: operating_result_trend_status.

Icono de riesgo caja: runway_status.

2) Gráfica 12M “Resultado operativo neto”

Dataset

erp_core.v_chart_operating_result_12m_display

Grano

1 fila por (client_code, instance_code, month).

Campos

client_code (text)

instance_code (text)

month (date, primer día de mes)

Series:

operating_result_net (numeric, 2 dec) Línea principal

revenue_total (numeric, 2 dec) Tooltip opcional

operating_spend_total (numeric, 2 dec) Tooltip opcional

Contexto tendencia:

avg_3m_prev (numeric, 2 dec)

delta_vs_3m (numeric, 2 dec)

delta_pct_vs_3m_pct (numeric, 1 dec, porcentaje) o null

trend_status (text)

trend_label (text)

Uso en UI

Línea: operating_result_net.

Tooltip: ingresos/gasto/variación vs 3M.

Si delta_pct_vs_3m_pct es null, ocultar %.

3) Card “Runway / Tesorería”

(Ya está dentro del resumen, pero si la quieres separada)

Dataset

erp_core.v_kpi_treasury_runway_signal_display

Grano

1 fila por (client_code, instance_code).

Campos

snapshot_date (date)

currency (text)

treasury_balance (numeric, 2 dec)

burn_operating_avg_3m (numeric, 2 dec)

runway_months (numeric, 1 dec)

runway_status (text)

runway_label (text)

4) Tabla/Lista “Alertas”

Dataset

erp_core.v_alerts_financial_12m

Grano

0..N filas por (client_code, instance_code) (y por mes).

Campos

Identidad:

client_code (text)

instance_code (text)

month (date)

Contexto:

revenue_total (numeric)

operating_spend_total (numeric)

operating_result_net (numeric)

Alerta mensual:

alert_code (text o null)

alert_label (text o null)

Estado caja (actual):

runway_status (text)

runway_label (text)

runway_months (numeric)

Uso en UI

Mostrar filas solo si existen.

Orden: month desc.

alert_code guía icono (warning/info). runway_status guía nivel de urgencia.

Convenciones recomendadas para Lovable

Filtros:

Siempre aplicar client_code = <selected> y instance_code = <selected>.

Formato:

Moneda: usar currency y mostrar € cuando sea EUR.

Nulls:

Si trend_status = neutral, mostrar etiqueta sin flecha.

Si runway_status = neutral, mostrar “Sin burn operativo”.

Lista de endpoints/datasets que Lovable necesita (mínimo)

v_card_financial_summary (card resumen)

v_chart_operating_result_12m_display (gráfica 12M)

v_alerts_financial_12m (lista de alertas)
