update erp_core.odoo_instances
set
  base_url = 'https://blacktar-engineering-works-sl.odoo.com',  -- cambia esto
  db_name  = 'blacktar-engineering-works-sl'               -- y esto
where instance_code = 'ODOO_MAIN';
