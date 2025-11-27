# **erp_finaptico**

ERP financiero modular construido sobre **Odoo**, **n8n**, **Supabase (Postgres)** y **Lovable**.  
El proyecto define una arquitectura escalable para centralizar, transformar y visualizar datos financieros procedentes de diferentes fuentes.

---

## 🚀 **Arquitectura general**

**Odoo**  
- Fuente principal de datos contables y bancarios.  
- Facturación, proveedores, bancos, gastos y nóminas.

**n8n**  
- Workflows de extracción, transformación y carga.  
- Integración con APIs de Odoo y escritura en Supabase.

**Supabase (Postgres)**  
- Base de datos estructurada por entidades mediante *schemas*.  
- Almacenamiento de históricos, documentos contables, KPIs y previsiones.

**Lovable**  
- Interfaz del ERP.  
- Paneles, KPIs, gráficos y generación de informes.

---

## 🎯 **Objetivo del proyecto**

Crear un ERP financiero propio que permita:

- Centralizar datos contables y bancarios de forma coherente.  
- Automatizar la sincronización y el cálculo de métricas.  
- Mostrar información clara y accionable en paneles y gráficos.  
- Generar informes comprensibles para perfiles directivos no técnicos.  
- Mantener una estructura modular y ampliable.

---

## 🗂️ **Modelo de datos**

El sistema utiliza *schemas* aislados por entidad o empresa dentro de Supabase.

Tablas previstas:

- `saldos_banco_diarios`  
- `facturas_emitidas`  
- `facturas_recibidas`  
- `nominas`  
- `asientos_contables`  
- `kpis_financieros`  
- `previsiones_fiscales`

---

## ⚙️ **Automatizaciones**

Workflows diseñados en n8n:

- Sincronización de bancos (diaria)  
- Carga de facturación y gastos  
- Sincronización de nóminas  
- Actualización de asientos contables  
- Cálculo de KPIs  
- Generación de previsiones fiscales  
- Mantenimiento y limpieza de datos

---

## 📌 **Estado del proyecto**

En desarrollo.  
Estructura técnica definida.  
Comienzo de implementación y carga inicial de datos.

---

## 🛣️ **Roadmap**

### **Fase 1 — Estructura de datos**
- Crear schemas independientes.
- Definir tablas base (bancos, facturas, gastos, nóminas).
- Configurar autenticación y roles mínimos.

### **Fase 2 — Ingesta de datos**
- Workflows n8n para bancos.
- Workflows n8n para facturas emitidas y recibidas.
- Workflows n8n para nóminas.
- Validación de integridad de datos.

### **Fase 3 — KPIs y cálculos**
- Cálculo automático de métricas clave.
- Previsiones fiscales (IVA, IRPF, IS).
- Panel interno de control de calidad de datos.

### **Fase 4 — Interfaz (Lovable)**
- Panel financiero general.
- Gráficos y visualizaciones.
- Informes descargables.
- Panel por entidad/empresa.

### **Fase 5 — Optimización**
- Mejora de rendimiento.
- Nuevas integraciones.
- Automatizaciones adicionales.
- Extensión modular según nuevas necesidades.
