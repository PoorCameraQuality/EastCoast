# Dancecard public embeds (Phase 7)

Narrow **read-only** HTML for schedule and venue maps, intended for **iframes** on an organizer’s marketing site. Tokens are **hashed at rest** (`dancecard_embed_tokens`); the browser receives the raw secret only once when minted in **Organizer → Integrations**.

## Prerequisites

1. Apply migration **`dancecard_027_phase7_embed_entitlements.sql`** (see `database/README_DANCECARD.md`).
2. Apply migration **`dancecard_040_ops_summary_embed.sql`** if you use the ops-summary iframe.
3. Mint an embed token via **`POST /api/organizer/dancecard/[eventSlug]/embed-tokens`** (Integrations UI) with `embedKind`: `schedule`, `map`, or `ops_summary`.
4. **`allowedOrigins`**: array of parent origins (e.g. `https://example.com`). **Required in production** when minting tokens. If set, requests without a matching `Origin` / `Referer` root receive **403**. Tokens with empty origins are rejected in production at verify time.

## iframe snippets

Replace `YOUR_HOST`, `YOUR_EVENT_SLUG`, and `YOUR_EMB_TOKEN` (the `emb_…` string shown once at mint).

**Schedule**

```html
<iframe
  title="Event schedule"
  src="https://YOUR_HOST/embed/dancecard/YOUR_EVENT_SLUG/schedule?token=YOUR_EMB_TOKEN"
  width="100%"
  height="640"
  style="border:0;border-radius:12px;max-width:960px"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

**Maps (signed images, ~1h)**

```html
<iframe
  title="Venue maps"
  src="https://YOUR_HOST/embed/dancecard/YOUR_EVENT_SLUG/map?token=YOUR_EMB_TOKEN"
  width="100%"
  height="720"
  style="border:0;border-radius:12px;max-width:960px"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

## Minimal chrome (C2K / parent sites)

Append **`chrome=minimal`** to hide the “Dancecard embed” micro-label and show a compact **Open full program on Dancecard →** link:

```html
src="https://YOUR_HOST/embed/dancecard/YOUR_EVENT_SLUG/schedule?token=YOUR_EMB_TOKEN&chrome=minimal"
```

The embed posts **`{ type: 'dc-embed-ready', height: number }`** to `parent` so hosts (e.g. Coast to Coast Kink) can resize the iframe.

### Ops summary (readiness metrics)

Read-only readiness card for Manage tab iframes. **Mint a separate token** with `embedKind: ops_summary` — a schedule token will **not** work on this URL (breaking change for integrators that reused one token).

```html
<iframe
  title="Dancecard readiness"
  src="https://YOUR_HOST/embed/dancecard/YOUR_EVENT_SLUG/ops-summary?token=YOUR_OPS_EMB_TOKEN"
  height="140"
  style="border:0;width:100%"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

## Coast to Coast Kink parent origins

When minting tokens in **Organizer → Integrations**, add allowed origins for the C2K web app, for example:

- `https://coasttocoastkink.com` (production)
- `https://www.coasttocoastkink.com`
- Staging host used by your C2K deploy (e.g. `https://staging.coasttocoastkink.com`)

C2K should store separate tokens for schedule and ops-summary iframes (`dancecardEmbedTokenHint` / ops token). See [`dancecard-c2k-integration.md`](./dancecard-c2k-integration.md).

## Security notes

- Global app responses still use **`X-Frame-Options: DENY`** except under **`/embed/*`**, where CSP sets **`frame-ancestors *`** so third-party sites may embed these routes.
- Module killswitches live in **`dancecard_event_entitlements.modules`** and are enforced server-side (`schedule_embed`, `map_embed`, etc.).

## Related code

- `src/app/embed/dancecard/[eventSlug]/schedule/route.ts`
- `src/app/embed/dancecard/[eventSlug]/ops-summary/route.ts`
- `src/app/embed/dancecard/[eventSlug]/map/route.ts`
- `src/lib/dancecard/embedTokenAuth.ts`, `embedHtml.ts`, `eventEntitlements.ts`
