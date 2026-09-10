# ECKE next steps (adapted)

The Downloads packet is the product spec. This repo already has a live `public.events` catalog (82 published rows). Use the additive schema in `database/ECKE_SUPABASE_SCHEMA.sql`, not the greenfield `CREATE TABLE events` file.

## Done
- Phase 1 chrome branding removal (in progress leftovers remain on some discovery cards)
- Additive `organizations` table on the live Supabase project (`owner_user_id` + `username`)
- `events.organization_id` added (nullable, so existing rows stay)
- Org signup/login uses Supabase Auth cookies (not a custom JWT)

## Test Phase 2
1. Open `/auth/org/signup`
2. Create a test org
3. Confirm redirect to `/dashboard`
4. Log out, then `/auth/org/login`

## Next (Phase 3)
Event create/edit writes into **existing** `public.events` with `status='published'`. Do not create a second events table.
