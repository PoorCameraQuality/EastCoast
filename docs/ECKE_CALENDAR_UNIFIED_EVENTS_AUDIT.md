# ECKE calendar unified events audit (Pass 4.1)

**Date:** 2026-06-25

---

## Before

| Surface | Event source |
|---------|----------------|
| `/events` | `getUnifiedEvents()` — static `events.js` + Supabase `events` (published, C2K rows preferred on slug conflict) |
| `/calendar` | `getAllEvents()` — **static only** |
| `/events/[slug]` | `resolveEventForPage()` — unified |

**Gap:** C2K/kink.social-published Supabase events appeared on `/events` but not `/calendar`.

---

## After (Pass 4.1)

| Surface | Event source |
|---------|----------------|
| `/calendar` | `getUnifiedEvents()` → `unifiedEventToEventsPageShape()` — **same as `/events` index** |
| Static events | Still included (static wins unless C2K row has `c2k_source_id`) |
| Supabase unavailable | Fails soft — calendar falls back to static events only |
| UI | Unchanged — same `CalendarClient` component |

`revalidate = 1800` added to match `/events` ISR cadence.

---

## Remaining gaps

- Calendar structured data may not include all Supabase-only events in JSON-LD (pre-existing; not changed this pass)
- No group events on calendar beyond what is in unified events (group **listings** are separate from group **events**)
