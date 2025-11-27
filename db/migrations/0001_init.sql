create schema if not exists erp_core;

create table if not exists erp_core.test_table (
  id bigserial primary key,
  created_at timestamptz default now()
);
