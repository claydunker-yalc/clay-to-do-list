-- Add section_order to thelist_tasks to support user-controlled section ordering.
--
-- WHY: Originally sections were rendered alphabetically (.order('section')),
-- which gave no control over where groups appear. Now every task carries a
-- `section_order` integer; all tasks within the same section share the same
-- value. Sections render in ascending section_order, then alpha as tiebreaker.
--
-- WHEN TO RUN: once, after pulling the "Add drag-to-reorder section groups"
-- change. Idempotent — safe to re-run.
--
-- BACKFILL LOGIC: for each user, assign section_order = 10, 20, 30, ... to
-- existing sections in current alphabetical order (matches what users see today
-- so nothing visually jumps on first load). The gaps of 10 leave room for
-- insertions without immediately re-packing everything.

alter table public.thelist_tasks
  add column if not exists section_order integer;

-- Backfill only rows where it's still null
with distinct_sections as (
  select distinct user_id, section
  from public.thelist_tasks
  where section is not null
),
ordered as (
  select user_id,
         section,
         (row_number() over (partition by user_id order by section)) * 10 as so
  from distinct_sections
)
update public.thelist_tasks t
set section_order = o.so
from ordered o
where t.user_id = o.user_id
  and t.section  = o.section
  and t.section_order is null;

-- Verify:
-- select section, section_order, count(*)
-- from public.thelist_tasks
-- group by section, section_order
-- order by section_order;
