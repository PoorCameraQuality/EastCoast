# Organizer auth and email setup (Supabase + Vercel + Resend)

**Audience:** Operators deploying Dancecard to production or staging.

Organizer sign-in, password reset, and sign-up confirmation are handled by **Supabase Auth**. Registrant **campaign email** (Messaging tab) is handled by **Resend** from the Next.js server on Vercel.

---

## 1. Supabase Auth (password reset and accounts)

### Vercel environment variables

Set these on **Production** and **Preview** (and `.env.local` for local dev):

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Same (server only, never expose to browser) |

Optional but recommended:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin, e.g. `https://www.eastcoastkinkevents.com` |

### Supabase Dashboard: URL configuration

**Authentication → URL Configuration**

| Field | Example (production) |
| --- | --- |
| **Site URL** | `https://www.eastcoastkinkevents.com` |
| **Redirect URLs** | Add all of these (adjust host as needed): |

```
https://www.eastcoastkinkevents.com/**
https://www.eastcoastkinkevents.com/organizer/login
https://www.eastcoastkinkevents.com/organizer/login?mode=new-password
http://localhost:3000/**
http://localhost:3000/organizer/login
http://localhost:3000/organizer/login?mode=new-password
```

Password reset emails redirect to:

`/organizer/login?mode=new-password&next=/organizer/dancecard`

That path is already wired in `OrganizerLoginClient.tsx` via `resetPasswordForEmail`.

### Email templates (Supabase)

**Authentication → Email Templates**

Customize **Confirm signup**, **Reset password**, and **Magic link** if you want ECKE branding. Supabase sends these by default using its mailer unless you configure **Custom SMTP** under **Project Settings → Authentication**.

For production volume and deliverability, many teams use **Custom SMTP** (Resend SMTP, SendGrid, etc.) in Supabase so auth mail and campaign mail share one domain.

### Enable email provider

**Authentication → Providers → Email**

- Email signups: **enabled**
- Confirm email: recommended **on** for production
- Secure password change: **on**

### Test password reset

1. Open `/organizer/login` → **Forgot password?**
2. Submit organizer email.
3. Click link in email; land on **Set new password**.
4. Sign in → `/organizer/dancecard`.

---

## 2. Resend (Messaging campaigns to registrants)

Campaign send uses `src/lib/dancecard/resendOutbound.ts` from:

- `POST …/message-templates/test-send`
- `POST …/message-campaigns/[id]/send`

### Resend account

1. Create a project at [resend.com](https://resend.com).
2. **Domains → Add domain** (e.g. `eastcoastkinkevents.com`).
3. Add DNS records Resend provides (SPF, DKIM).
4. Wait until domain shows **Verified**.

### Vercel environment variables

| Variable | Example |
| --- | --- |
| `RESEND_API_KEY` | `re_…` from Resend API Keys |
| `DANCECARD_RESEND_FROM` | `Dancecard <updates@eastcoastkinkevents.com>` |

`DANCECARD_RESEND_FROM` must use an address on your **verified** domain.

Redeploy Vercel after adding env vars.

### Test in the console

1. Sign in as organizer on an event.
2. **Communications → Messaging**.
3. Create a template → **Send test** to your email.
4. Create a campaign → choose audience → **Send** (only when ready; this hits real registrant emails).

If env vars are missing, the API returns **503** with a message pointing to this doc.

---

## 3. Local development notes

| Topic | Guidance |
| --- | --- |
| Organizer dev bypass | `DANCECARD_ORGANIZER_DEV_BYPASS=1` in `.env.local` skips organizer login locally. **Never** set on Vercel production. |
| Supabase local | Redirect URLs must include `http://localhost:3000/**` |
| Resend | Use a test API key; send tests only to your own inbox until domain is verified |

---

## 4. Adding organizer teammates (not Supabase team seats)

Each organizer is a row in `dancecard_event_organizers` linked to `auth.users`.

```bash
node scripts/dancecard-add-organizer.mjs teammate@example.com your-event-slug editor
```

Roles: `owner`, `editor`, `viewer`, `safety` (safety via SQL if script does not list it yet).

The user must already exist in **Authentication → Users** (they sign up at `/organizer/login` first).

---

## 5. Checklist before inviting testers

- [ ] Supabase Site URL and Redirect URLs include production and localhost
- [ ] Email confirmation and reset templates tested end to end
- [ ] `NEXT_PUBLIC_*` and `SUPABASE_SERVICE_ROLE_KEY` on Vercel
- [ ] Resend domain verified; `RESEND_API_KEY` and `DANCECARD_RESEND_FROM` on Vercel
- [ ] Test campaign **Send test** from Messaging tab
- [ ] `DANCECARD_ORGANIZER_DEV_BYPASS` unset on production
- [ ] Teammates granted via `dancecard-add-organizer.mjs` or SQL

---

See also: [dancecard-first-run.md](./dancecard-first-run.md)
