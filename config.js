/*
 * Supabase connection config for The List.
 *
 * SAFETY: The anon key is designed to be public. Row-Level Security (RLS)
 * policies on thelist_tasks and thelist_archive are what keep one user
 * from reading another user's rows. If RLS is ever disabled on those
 * tables, this key would expose data. See `sql/verify_rls.sql` (or run
 * `select * from pg_policies where tablename like 'thelist_%';`) to
 * confirm policies are still in place.
 *
 * Why a separate file: keeps the creds out of index.html for clarity,
 * and makes it easy to swap in a different project later without
 * touching app code.
 */

export const SUPABASE_URL = 'https://libkdykbuhpvcnrqixko.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYmtkeWtidWhwdmNucnFpeGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNzk0MTYsImV4cCI6MjA4NDk1NTQxNn0.CjM6DEH7c4ptu0wIhRMm84mCG_dQljZsEIIR9eYhz_E';
