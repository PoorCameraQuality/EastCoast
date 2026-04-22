# Dancecard SQL

- `dancecard_000_schema.sql` — creates all `dancecard_*` tables (idempotent `IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`).
- `dancecard_seed_paf26_demo.sql` — upserts event `paf26` with a May 2026 window. Program rows come from `data/paf26-program-slots.json` via `npm run dancecard:import` (see first-run doc).

See [docs/dancecard-first-run.md](../docs/dancecard-first-run.md) for apply order and smoke tests.
