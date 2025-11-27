create table if not exists erp_core.odoo_accounts (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references erp_core.odoo_instances(id) on delete cascade,
  odoo_id integer not null,
  code text,
  name text,
  user_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(instance_id, odoo_id)
);

create table if not exists erp_core.odoo_journals (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references erp_core.odoo_instances(id) on delete cascade,
  odoo_id integer not null,
  name text,
  type text,
  currency text,
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(instance_id, odoo_id)
);

create table if not exists erp_core.odoo_bank_statements (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references erp_core.odoo_instances(id) on delete cascade,
  odoo_id integer not null,
  journal_id integer,
  balance numeric,
  currency text,
  fetched_at timestamptz default now(),
  unique(instance_id, odoo_id)
);
