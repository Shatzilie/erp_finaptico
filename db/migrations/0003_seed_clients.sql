insert into erp_core.clients (code, label)
values ('CLIENT_001', 'Cliente principal de prueba')
on conflict (code) do nothing;

insert into erp_core.odoo_instances (client_id, instance_code, base_url, db_name)
select
  c.id,
  'ODOO_MAIN',
  'https://mi-odoo.url',   -- sustituiremos después
  'mi-db-odoo'
from erp_core.clients c
where c.code = 'CLIENT_001'
on conflict do nothing;
