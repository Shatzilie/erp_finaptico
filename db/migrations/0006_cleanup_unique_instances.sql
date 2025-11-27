-- Borrar datos de prueba de saldos
truncate table erp_core.treasury_balances;

-- Dejar solo una fila por instance_code en odoo_instances
with ranked as (
  select
    id,
    instance_code,
    row_number() over (partition by instance_code order by created_at) as rn
  from erp_core.odoo_instances
)
delete from erp_core.odoo_instances
where id in (select id from ranked where rn > 1);

-- Asegurar que no se repite el code de clients
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'clients_code_unique'
  ) then
    alter table erp_core.clients
      add constraint clients_code_unique unique (code);
  end if;
end
$$;

-- Asegurar que no se repite el instance_code en odoo_instances
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'odoo_instances_instance_code_unique'
  ) then
    alter table erp_core.odoo_instances
      add constraint odoo_instances_instance_code_unique unique (instance_code);
  end if;
end
$$;
