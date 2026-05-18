# Dancecard Handoff — 2026-05-18 (end of night)

**Supersedes for deploy/status:** [dancecard-handoff-2026-05-17.md](./dancecard-handoff-2026-05-17.md) (local dev UX session).  
**Canonical product plan:** [DANCECARD_MASTER_PRODUCT_ROADMAP.md](./DANCECARD_MASTER_PRODUCT_ROADMAP.md)  
**Tracker:** [GENERIC_DANCECARD_IMPLEMENTATION_TRACKER.md](./GENERIC_DANCECARD_IMPLEMENTATION_TRACKER.md)

---

## Where we are (one paragraph)

The **full Generic Dancecard platform** (organizer console, attendee app, APIs, embeds, migrations **007–040**, docs, and marketing assets) is **committed and pushed** to GitHub on **`master`** as **`931bc94`** (`feat(dancecard): ship organizer console, attendee app, and cleanup`). A **dead-code cleanup** removed prototype/visual-lab routes, unused site components, and trimmed unused lib exports. **Production build passes** with `DANCECARD_ORGANIZER_DEV_BYPASS` unset. **Post-deploy work** remains: apply SQL on production Supabase, confirm Vercel env, then run `npm run dancecard:smoke:prod`.

**Repo:** https://github.com/PoorCameraQuality/EastCoast.git  
**Previous remote tip:** `41d608d` → **current:** `931bc94`

---

## Shipped in `931bc94`

| Area | Notes |
| --- | --- |
| **Migrations** | `database/dancecard_007` … `040` + `dancecard_full_bundle.sql`, `dancecard_verify_schema.sql` |
| **Organizer** | `/organizer/dancecard`, event shell, program/people/settings/integrations, import, venue maps, registrants, messaging, exports |
| **Attendee** | `/dancecard/[slug]` — schedule, compare, reserve, policies, map, staff, trusted roles, share links |
| **APIs** | Attendee + organizer + external + webhooks + cron retry |
| **Embeds** | `/embed/dancecard/[slug]/schedule`, `map`, `ops-summary` |
| **C2K** | Handoff route `/organizer/dancecard/handoff`, ops card integration |
| **Cleanup** | Removed `dancecard-prototype`, `dancecard-visual-lab`, `dancecard-attendee-prototype` trees; ~19 site-wide dead files; `rabbitsignClient.ts` (webhook route kept); unused lib exports |

**Intentionally kept:** orphan public policy GET routes (`policy-summary`, etc.), `mintC2kHandoffCode`, `DancecardHeaderNav.tsx`, `projectfilesmigration/`, Sentry/logging scaffolding.

---

## Verification (2026-05-18)

| Check | Result |
| --- | --- |
| `npm run test:dancecard-conflicts` | Pass |
| `npm run test:dancecard-registrant-rbac` | Pass |
| `npm run build` (`DANCECARD_ORGANIZER_DEV_BYPASS` empty) | Pass |
| `npm run dancecard:smoke:prod` (pre-deploy) | Fail — production still on old deploy (404 for new routes) |
| Local `dancecard:smoke` | Unreliable without seeded DB + single dev server |

---

## Production deploy checklist (next session)

1. **Vercel:** Ensure `DANCECARD_ORGANIZER_DEV_BYPASS` is **not** set in Production (build asserts via `assertProductionNoOrganizerBypass`).
2. **Supabase:** Apply migrations **007–040** (or paste `dancecard_full_bundle.sql` on greenfield; skip PAF seed if not needed). Run `dancecard_verify_schema.sql` → expect **PASS (000–040)** after bundle regen if verify script was updated.
3. **Smoke:** After deploy completes: `npm run dancecard:smoke:prod`
4. **Optional:** `npm run dancecard:verify-prod`, `npm run dancecard:smoke:auth:prod`

---

## Local dev (fresh start)

```bash
cd EastCoast-master
npm run clean          # or dev:clean
npm run dev            # ONE instance → http://localhost:3000 only
npm run dancecard:seed-sandbox   # optional demo data
```

| Variable | Notes |
| --- | --- |
| `DANCECARD_ORGANIZER_DEV_BYPASS=1` | Local only — orange banner; **never** production build |
| `NEXT_PUBLIC_SUPABASE_*` | Required for real data |

**Sandbox URLs (after seed):**

- Organizer: http://localhost:3000/organizer/dancecard/sandbox  
- Attendee: http://localhost:3000/dancecard/sandbox  

---

## Removed dev islands (do not restore without product decision)

- `src/app/dancecard-prototype/`
- `src/app/dancecard-attendee-prototype/`
- `src/app/dancecard-visual-lab/`
- `src/components/dancecard/prototype/`
- `src/components/dancecard/styleguide/`

Promotion notes in [dancecard-visual-lab-promotion.md](./dancecard-visual-lab-promotion.md) are **historical**; patterns live in `src/components/dancecard/ui/`.

---

## Backlog (not blocking deploy)

See [DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md](./DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md) and [DANCECARD_UI_UX_MASTER_PLAN.md](./DANCECARD_UI_UX_MASTER_PLAN.md).

- Postgres RLS hardening (optional second layer)
- Expanded CI beyond smoke scripts
- Observability / Sentry wiring (`ErrorTracker` still disabled in layout)
- Public self-serve registration checkout parity
- RegFox / MailerLite / Sheets **pull** integrations (Phase C — out of scope for this push)

---

## Untracked local scratch (not in git)

Do not commit: `build-log.txt`, `chunk.js`, `page.html`, `skills-lock.json`, `.agents/`

---

## Reference docs (updated 2026-05-18)

| Doc | Purpose |
| --- | --- |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Site-wide + Dancecard status at a glance |
| [database/README_DANCECARD.md](../database/README_DANCECARD.md) | SQL apply order through **040** |
| [dancecard-first-run.md](./dancecard-first-run.md) | Smoke, imports, env |
| [ORGANIZER_AUTH_AND_EMAIL_SETUP.md](./ORGANIZER_AUTH_AND_EMAIL_SETUP.md) | Auth + Resend |

---

*Handoff author: Cursor agent session 2026-05-18. Update when production deploy and migrations are confirmed.*
