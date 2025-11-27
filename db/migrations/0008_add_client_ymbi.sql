-- Cliente 2: YMBI
insert into erp_core.clients (code, label)
values ('CLIENT_002', 'Young Minds Big Ideas')
on conflict (code) do nothing;

-- Instancia Odoo para YMBI
insert into erp_core.odoo_instances (client_id, instance_code, base_url, db_name)
select
  c.id,
  'ODOO_YMBI',
  'https://young-minds-big-ideas-sl.odoo.com/',
  'young-minds-big-ideas-sl'
from erp_core.clients c
where c.code = 'CLIENT_002'
on conflict (instance_code) do nothing;
