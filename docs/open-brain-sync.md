# Open Brain / Hermes sync notes

The List can be linked to Clay Mate / Open Brain action items through the trusted `sync-the-list` Edge Function in the `clay-mate` repo.

## Public app safety

The static app only stores:

- The List Supabase URL.
- The List Supabase anon key.
- The public URL of the sync function (`SYNC_THE_LIST_FUNCTION_URL`).

Do **not** add service-role keys, Open Brain secrets, Hermes tokens, or the sync shared secret to this repo.

## Database migration

Run `sql/20260610204158_external_sync_columns.sql` once in The List's Supabase project. It adds nullable external sync metadata to `thelist_tasks`:

- `external_source`
- `external_id`
- `external_url`
- `synced_at`

It also adds a unique partial index so repeated backend syncs do not duplicate linked Open Brain tasks.

## Clear-completed behavior

When Clay presses **Clear completed**, the app now checks whether any completed rows are linked to Clay Mate action items (`external_source = 'clay_mate_action_items'`).

- If no linked completed tasks exist, clearing works locally as before.
- If linked completed tasks exist, the app calls `${SYNC_THE_LIST_FUNCTION_URL}/complete` with Clay's current The List session bearer token.
- If completion sync succeeds, local clearing proceeds.
- If completion sync fails, the app warns Clay and asks whether to clear anyway.
