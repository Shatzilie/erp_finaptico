Contrato de datos — Módulo Fiscal (IVA · IRPF · IS)
1. Propósito del contrato

Este contrato define qué datos fiscales existen, de dónde salen, cómo se calculan, qué significan y cómo pueden usarse dentro del sistema Finaptico.

Objetivo principal:

Proveer previsión fiscal clara, fiable y accionable, en modo solo lectura, sin sustituir la presentación oficial ante la AEAT.

El módulo fiscal no es contabilidad, es control y previsión.

2. Alcance del módulo fiscal

Incluye exclusivamente:

Modelo 303 (IVA)

IVA devengado

IVA soportado

Resultado del trimestre (a ingresar / a compensar / cero)

Modelo 111 (IRPF / retenciones)

Retenciones practicadas en facturas de proveedores

Excluye explícitamente:

Modelo 115 (arrendamientos) → no activo actualmente

Presentación oficial de modelos

Generación de ficheros AEAT

Ajustes manuales

3. Principios obligatorios

Solo lectura
El sistema nunca genera obligaciones fiscales, solo las estima.

Automático
No se introduce ningún dato a mano.

Fechas acotadas

Trimestre actual

Trimestre inmediatamente anterior

Histórico largo solo bajo demanda

Enfoque a decisión, no a memoria
El cliente ve:

qué toca ahora

cuánto falta

si hay riesgo o no

Separación cliente / asesora

La asesora necesita histórico completo

El cliente necesita claridad y calma

4. Fuentes de datos oficiales
4.1 Origen único

Todos los cálculos fiscales derivan exclusivamente de:

erp_core.sales_invoices

erp_core.purchase_documents

erp_core.purchase_document_lines

erp_core.purchase_document_line_taxes

No se admiten:

Totales manuales

Campos calculados en frontend

Datos externos a Odoo

5. Reglas fiscales implementadas
5.1 IVA (Modelo 303)

IVA devengado

Procede de facturas emitidas

Se calcula a partir de líneas con tax_kind = tax

Se asigna por fecha de factura

Se agrupa por trimestre natural

IVA soportado

Procede de facturas de proveedor

Se calcula por líneas de impuestos

Incluye inversión del sujeto pasivo y UE según configuración Odoo

Retenciones no forman parte del IVA

Resultado IVA

vat_resultado = vat_devengado – vat_soportado


Estados posibles:

a_ingresar

a_compensar

cero

5.2 IRPF / Retenciones (Modelo 111)

Se calcula únicamente desde:

purchase_document_line_taxes

tax_kind = 'withholding'

Los importes son negativos por definición

No se compensan con IVA

Se agrupan por trimestre natural

6. Vistas fiscales oficiales
6.1 Vista principal — 303 por trimestre
erp_core.v_panel_fiscal_303_default


Campos:

client_code

instance_code

scope (current | previous)

quarter_start

quarter_end

vat_devengado

vat_soportado

vat_resultado

vat_status

✔ Vista base del panel fiscal
✔ Validada con datos reales

6.2 Estado fiscal consolidado
erp_core.v_panel_fiscal_status


Campos:

client_code

instance_code

vat_status

vat_resultado

fiscal_status (tranquilo | observacion | tension)

Regla:

El estado fiscal no depende solo del importe, sino del contexto.

6.3 Fechas límite
erp_core.v_panel_fiscal_303_deadline


Define la fecha límite de presentación del trimestre actual

No calcula sanciones

Solo informa

7. Presentación en dashboard (regla de oro)
Vista por defecto (cliente)

Bloque principal (siempre visible)

Trimestre actual

IVA estimado hoy

IRPF estimado hoy

Estado fiscal

Fecha límite de presentación

Bloque secundario (plegable)

Trimestre anterior

Resultado final presentado

Diferencia previsión vs real

Histórico largo

Nunca visible por defecto

Solo en:

pestaña “Histórico fiscal”

modal “Ver evolución”

8. Validaciones automáticas

El sistema debe poder detectar:

Falta de datos fiscales en el trimestre

Trimestres sin movimiento

Cambios bruscos de tendencia

Inconsistencias entre IVA y facturación

⚠️ Las validaciones alertan, no bloquean.

9. Limitaciones explícitas

Este módulo:

❌ No sustituye la presentación oficial

❌ No calcula recargos ni sanciones

❌ No gestiona aplazamientos

❌ No realiza asientos contables

10. Regla final (inmutable)

El dashboard fiscal del cliente no es para entender Hacienda.
Es para no sufrirla.

La asesora dirige con datos completos.
El cliente dirige con claridad.
