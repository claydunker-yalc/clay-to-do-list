-- Row-Level Security policies for The List
--
-- WHY THIS FILE EXISTS:
--   The Supabase anon key shipped in config.js is public by design. The ONLY
--   thing keeping one user from reading/writing another user's rows is RLS.
--   Without these policies, either:
--     (a) RLS is off → anyone with the anon key can read every user's data, or
--     (b) RLS is on with no policies → all authenticated requests get 403
--         Forbidden (this is what happened on 2026-04-24 when inserts silently
--         failed during first migration attempt; legacy localStorage data was
--         safe but the cloud uploads were blocked).
--
-- WHEN TO RE-RUN:
--   - After recreating thelist_tasks or thelist_archive from scratch.
--   - If `select * from pg_policies where tablename like 'thelist_%';` returns
--     fewer than 8 rows (4 per table: select/insert/update/delete).
--
-- WHAT IT DOES:
--   - Enables RLS on both tables (no-op if already enabled).
--   - Drops any existing policies on these two tables (clean slate — safe
--     because this file is the single source of truth).
--   - Creates owner-only CRUD policies keyed on auth.uid() = user_id.
--
-- EDGE CASES HANDLED:
--   - The `do $$ ... $$` block iterates pg_policies so it works whether the
--     previous policies were named these exact names or something else.
--   - `with check` is set on insert/update so users can't change row ownership
--     (e.g. can't UPDATE user_id to someone else's id).
--
-- VERIFY AFTER RUNNING:
--   select tablename, policyname, cmd
--   from pg_policies
--   where schemaname='public' and tablename like 'thelist_%'
--   order by tablename, cmd;
--   -- Should return 8 rows.

alter table public.thelist_tasks   enable row level security;
alter table public.thelist_archive enable row level security;

do $$
declare p record;
begin
  for p in select policyname, tablename from pg_policies
           where schemaname='public' and tablename in ('thelist_tasks','thelist_archive')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- thelist_tasks: owner-only CRUD
create policy "tasks_select_own" on public.thelist_tasks
  for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.thelist_tasks
  for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.thelist_tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.thelist_tasks
  for delete using (auth.uid() = user_id);

-- thelist_archive: owner-only CRUD
create policy "archive_select_own" on public.thelist_archive
  for select using (auth.uid() = user_id);
create policy "archive_insert_own" on public.thelist_archive
  for insert with check (auth.uid() = user_id);
create policy "archive_update_own" on public.thelist_archive
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "archive_delete_own" on public.thelist_archive
  for delete using (auth.uid() = user_id);
