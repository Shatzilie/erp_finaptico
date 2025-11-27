-- Extensión para UUID
create extension if not exists "pgcrypto";

create schema if not exists erp_core;

-- Tabla de clientes (alias internos, sin nombres reales)
create table if not exists erp_core.clients (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,              -- ej: CLIENTE_001
  label text not null,                    -- alias descriptivo interno
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla de instancias Odoo conectadas
create table if not exists erp_core.odoo_instances (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references erp_core.clients(id) on delete cascade,
  instance_code text not null,           -- ej: ODOO_MAIN
  base_url text not null,                -- url de la instancia
  db_name text not null,                 -- nombre de la base en Odoo
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_odoo_instances_client
  on erp_core.odoo_instances (client_id);
