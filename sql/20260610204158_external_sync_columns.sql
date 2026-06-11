-- Add external sync metadata for trusted backend integrations such as
-- Clay Mate / Open Brain -> The List.
--
-- These columns are intentionally nullable so local/manual The List tasks
-- remain untouched. The unique partial index makes repeated backend syncs
-- idempotent without affecting local-only rows.

alter table public.thelist_tasks
  add column if not exists external_source text,
  add column if not exists external_id text,
  add column if not exists external_url text,
  add column if not exists synced_at timestamptz;

create unique index if not exists thelist_tasks_external_source_id_idx
  on public.thelist_tasks (external_source, external_id)
  where external_source is not null and external_id is not null;

create index if not exists thelist_tasks_user_external_source_idx
  on public.thelist_tasks (user_id, external_source)
  where external_source is not null;

-- Verify:
-- select column_name from information_schema.columns
-- where table_schema='public' and table_name='thelist_tasks'
--   and column_name in ('external_source','external_id','external_url','synced_at')
-- order by column_name;
