create table if not exists erp_core.sync_runs (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references erp_core.odoo_instances(id) on delete cascade,
  source text not null,                          -- 'n8n', 'edge_function', etc.
  job_name text not null,                       -- ej: 'sync_bank_balances'
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text default 'running',                -- 'running' | 'success' | 'error'
  error_message text
);

create index if not exists idx_sync_runs_instance
  on erp_core.sync_runs (instance_id, started_at desc);

create table if not exists erp_core.treasury_balances (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references erp_core.odoo_instances(id) on delete cascade,
  journal_odoo_id integer not null,
  snapshot_date date not null,
  balance numeric not null,
  currency text,
  created_at timestamptz default now(),
  unique(instance_id, journal_odoo_id, snapshot_date)
);
