create or replace view erp_core.v_treasury_daily_balances as
select
  c.code as client_code,
  oi.instance_code,
  t.journal_odoo_id,
  t.snapshot_date,
  t.balance,
  t.currency
from erp_core.treasury_balances t
join erp_core.odoo_instances oi on oi.id = t.instance_id
join erp_core.clients c on c.id = oi.client_id;

create or replace view erp_core.v_treasury_client_totals as
select
  c.code as client_code,
  oi.instance_code,
  t.snapshot_date,
  sum(t.balance) as total_balance,
  max(t.currency) as currency
from erp_core.treasury_balances t
join erp_core.odoo_instances oi on oi.id = t.instance_id
join erp_core.clients c on c.id = oi.client_id
group by
  c.code,
  oi.instance_code,
  t.snapshot_date;
