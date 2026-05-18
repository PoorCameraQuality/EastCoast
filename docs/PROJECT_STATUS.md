# East Coast Kink Events — project status

**Last updated:** 2026-05-18 (end of night)  
**App root:** `EastCoast-master/`  
**Git:** `master` @ **`931bc94`** — pushed to https://github.com/PoorCameraQuality/EastCoast.git

---

## Summary

| Track | Status |
| --- | --- |
| **ECKE marketing site** | Stable — events, dungeons, education, vendors, SEO, submissions |
| **Dancecard platform** | **Shipped to GitHub** — full organizer + attendee product, migrations 007–040, dead-code cleanup |
| **Production deploy** | **Pending** — Vercel build from `931bc94`; Supabase migrations on prod DB |
| **Local dev** | Stopped for the night; caches cleared (`npm run clean`) |

---

## Dancecard (primary focus)

**What’s done**

- Phases **0–7** product surface in code (see [DANCECARD_MASTER_PRODUCT_ROADMAP.md](./DANCECARD_MASTER_PRODUCT_ROADMAP.md) §3.3–§3.10).
- Generic platform wave (event profile, people hub, agreements, attendee guide) — tracker all **done**: [GENERIC_DANCECARD_IMPLEMENTATION_TRACKER.md](./GENERIC_DANCECARD_IMPLEMENTATION_TRACKER.md).
- Git commit **`931bc94`** — 603 files, migrations through **040**, prototype/visual-lab removed.
- Build + unit selftests pass locally.

**What’s next**

1. Vercel production deploy from `master`.
2. Apply `database/dancecard_007` … `040` (or bundle) on **production** Supabase.
3. `npm run dancecard:smoke:prod` after deploy.
4. Polish / hardening from [DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md](./DANCECARD_POST_ROADMAP_POLISH_BACKLOG.md).

**Latest handoff:** [dancecard-handoff-2026-05-18.md](./dancecard-handoff-2026-05-18.md)

---

## ECKE site (non-Dancecard)

- Next.js **14.2.35**, Node **20.x** — see [technical-reference.md](./technical-reference.md).
- Static listings in `src/data/`; submissions and admin via Supabase.
- Mobile uplift docs: `MOBILE_FIRST_PRINCIPLES.md`, `MOBILE_QA_ROLLOUT.md`.

---

## Commands (quick reference)

```bash
cd EastCoast-master
npm run dev                 # single instance, port 3000
npm run clean               # remove .next cache
npm run build               # unset DANCECARD_ORGANIZER_DEV_BYPASS for prod-like build
npm run dancecard:smoke:prod
npm run dancecard:apply-migrations   # needs DATABASE_URL
```

---

## Session log (recent)

| Date | Milestone |
| --- | --- |
| 2026-05-17 | Generic Dancecard wave; migrations 030–031; local CSS/dev-server fixes — [handoff](./dancecard-handoff-2026-05-17.md) |
| 2026-05-18 | Full platform push + dead-code cleanup; commit `931bc94`; push to GitHub — [handoff](./dancecard-handoff-2026-05-18.md) |

---

*Update this file at the end of major sessions or after production deploy confirmation.*
