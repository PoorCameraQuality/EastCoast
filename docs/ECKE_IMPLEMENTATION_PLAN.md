# ECKE Implementation Plan
## Self-Contained Event Listing Platform (No kink.social Sync)

---

## Overview

**What you're building:**
- Independent Supabase database (ECKE only, not synced from kink.social)
- Organizations self-signup with username/password
- Orgs create/edit/delete events, auto-published immediately
- Public discovery site (browse, search, filter events)
- Email-based password recovery

**What you're NOT building:**
- Approval workflows
- Multi-staff org logins (single login per org for now)
- Ticketing or registrations
- Syncing with kink.social

---

## Phase 1: Branding Removal ✓
**Status: DONE** (already landed)
- All kink.social references removed
- Header/footer updated
- ECKE branding in place

---

## Phase 2: Database Setup & Org Login
**Duration: 1-2 days**

### 2.1 Create Supabase Tables
Run the SQL in `ECKE_SUPABASE_SCHEMA.sql`:
- `organizations` (org profile: name, email, website, logo, description)
- `org_credentials` (login: username, password_hash, email for recovery)
- `events` (event data: title, location, date, description, etc.)

### 2.2 Create Auth Types
File: `src/types/auth.ts`

```typescript
export interface OrgSignupRequest {
  organizationName: string;
  email: string;
  website?: string;
  username: string;
  password: string;
}

export interface OrgLoginRequest {
  username: string;
  password: string;
}

export interface OrgLoginResponse {
  token: string; // JWT
  organizationId: string;
  organizationName: string;
  expiresIn: number;
}

export interface OrgAuthSession {
  token: string;
  organizationId: string;
  username: string;
  expiresAt: number;
}
```

### 2.3 Create Auth Utilities
File: `src/lib/authUtils.ts`

```typescript
// Core functions needed:
export function generateJWT(orgId: string, expiresIn: number): string
export function verifyJWT(token: string): { orgId: string } | null
export async function hashPassword(password: string): Promise<string>
export async function comparePassword(password: string, hash: string): Promise<boolean>
export function generateUsername(orgName: string): string
```

Dependencies:
```bash
npm install jsonwebtoken bcrypt
npm install --save-dev @types/jsonwebtoken @types/bcrypt
```

### 2.4 Create Org Signup API
File: `app/api/auth/org/signup/route.ts`

**Endpoint:** `POST /api/auth/org/signup`

**Request:**
```json
{
  "organizationName": "Southeastern Power Exchange",
  "email": "contact@sepowerexchange.com",
  "website": "https://southeastpowerexchange.com",
  "username": "sepowerexchange",
  "password": "SecurePassword123!"
}
```

**Logic:**
1. Validate input with Zod
2. Check if username already exists
3. Check if email already exists
4. Hash password with bcrypt
5. Create org + credentials in transaction
6. Return login token immediately

**Response:**
```json
{
  "token": "eyJhbGc...",
  "organizationId": "uuid",
  "organizationName": "Southeastern Power Exchange",
  "expiresIn": 86400
}
```

### 2.5 Create Org Login API
File: `app/api/auth/org/login/route.ts`

**Endpoint:** `POST /api/auth/org/login`

**Request:**
```json
{
  "username": "sepowerexchange",
  "password": "SecurePassword123!"
}
```

**Logic:**
1. Query org_credentials by username
2. Compare password with bcrypt
3. Update last_login timestamp
4. Generate JWT token
5. Return token + org info

**Response:**
```json
{
  "token": "eyJhbGc...",
  "organizationId": "uuid",
  "organizationName": "Southeastern Power Exchange",
  "expiresIn": 86400
}
```

### 2.6 Create Password Recovery API
File: `app/api/auth/org/recover-password/route.ts`

**Endpoint:** `POST /api/auth/org/recover-password`

**Request:**
```json
{
  "email": "contact@sepowerexchange.com"
}
```

**Logic:**
1. Find org_credentials by email
2. Generate reset token (JWT with 1-hour expiry)
3. Send email with reset link
4. Return success message

**Note:** Actual email sending handled via Supabase Postgres functions or external service (Resend, SendGrid, etc.)

### 2.7 Create Auth Context/Hook
File: `src/hooks/useOrgAuth.ts`

```typescript
export function useOrgAuth() {
  const [session, setSession] = useState<OrgAuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage/cookie on mount
    const token = localStorage.getItem('ecke_token');
    if (token && verifyJWT(token)) {
      setSession(parseToken(token));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/org/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    localStorage.setItem('ecke_token', data.token);
    setSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('ecke_token');
    setSession(null);
  };

  return { session, isLoading, login, logout, isAuthenticated: !!session };
}
```

### 2.8 Create Protected Routes Middleware
File: `src/lib/authMiddleware.ts`

```typescript
export function withOrgAuth(handler: Function) {
  return async (request: Request) => {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const payload = verifyJWT(token);
    
    if (!payload) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Pass org ID to handler
    return handler(request, payload.orgId);
  };
}
```

---

## Phase 3: Org Dashboard & Event CRUD Form
**Duration: 2-3 days**

### 3.1 Create Org Signup Page
File: `app/auth/org/signup/page.tsx`

- Form fields: Org name, email, website, username, password, confirm password
- Submit to `/api/auth/org/signup`
- On success: Redirect to dashboard + set auth token
- Validation with Zod

### 3.2 Create Org Login Page
File: `app/auth/org/login/page.tsx`

- Form fields: Username, password, "Remember me" checkbox
- Submit to `/api/auth/org/login`
- On success: Redirect to dashboard
- "Forgot password?" link

### 3.3 Create Password Reset Page
File: `app/auth/org/reset-password/page.tsx`

- Enter email → sends reset link
- Link token in URL → shows password reset form
- Update password endpoint

### 3.4 Create Org Dashboard
File: `app/dashboard/page.tsx` (protected, requires org auth)

- Display org info: name, email, website, logo
- Stats: total events, published, drafts
- Event list table with: title, date, status, views, actions
- "Create Event" button
- "Edit Org Profile" link
- Logout button

### 3.5 Create Event Form Component
File: `src/components/EventForm.tsx`

**Form sections (one page or multi-step):**

1. **Basics**
   - Title (required)
   - Type (dropdown: Convention, Workshop, Dungeon, Social, Class, etc.)
   - Slug (auto-generate from title, allow edit)

2. **Description**
   - Rich text editor (Tiptap)
   - Can include formatted text, links, lists

3. **Location**
   - Venue name
   - Address (with autocomplete if possible)
   - City, State, Zip
   - Region/state selector
   - Coordinates (manual or auto-geocoded)

4. **Timing**
   - Start date (required)
   - Start time (optional)
   - End date (optional)
   - End time (optional)
   - Date status: Confirmed / TBA / Tentative
   - Recurring event toggle + rule builder

5. **Details**
   - Age restriction (18+, 21+, None)
   - Dress code (optional)
   - Expected attendance (optional)
   - Entry fee (optional)

6. **Media**
   - Cover image upload (required)
   - Gallery images (optional, up to 5)
   - Image preview + delete

7. **Contact**
   - Contact email (pre-fill org email, can change)
   - Contact phone (optional)
   - Official website link (optional)

8. **Tags**
   - Searchable multi-select
   - Pre-defined: BDSM, Rope, Impact, Furniture, Bondage, Social, Education, Dungeon, Convention, Workshop, Beginner-Friendly, etc.
   - Allow custom tags

9. **Publish**
   - Save as draft button
   - Publish button (sets status='published', published_at=now)
   - Preview (shows event detail page as it will appear)

**Validation with Zod schema:**
```typescript
const EventFormSchema = z.object({
  title: z.string().min(5).max(500),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  eventType: z.string(),
  description: z.string().min(20).max(5000),
  richDescription: z.any().optional(),
  location: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string().optional(),
    region: z.string(),
  }),
  timing: z.object({
    startDate: z.date(),
    startTime: z.string().optional(),
    endDate: z.date().optional(),
    endTime: z.string().optional(),
    dateStatus: z.enum(['confirmed', 'tba', 'tentative']),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    website: z.string().url().optional(),
  }),
  tags: z.array(z.string()).max(10),
});
```

### 3.6 Create Event CRUD APIs
File: `app/api/events/route.ts`

**POST** `/api/events` - Create event
- Require org auth
- Validate with Zod
- Insert into events table with organization_id
- Return created event

**PUT** `/api/events/[eventId]` - Update event
- Require org auth
- Verify org owns this event
- Update fields
- Return updated event

**DELETE** `/api/events/[eventId]` - Delete event
- Require org auth
- Verify org owns this event
- Delete or soft-delete (set status='archived')

### 3.7 Create Event Edit Page
File: `app/dashboard/events/[eventId]/page.tsx`

- Protected, org auth required
- Fetch event from API
- Pre-populate form with existing data
- Allow editing all fields
- Delete button (with confirmation)

### 3.8 Create Event Create Page
File: `app/dashboard/events/create/page.tsx`

- Protected, org auth required
- Empty form
- On submit: POST to /api/events, redirect to dashboard

---

## Phase 4: Public Discovery Pages
**Duration: 1-2 days**

### 4.1 Create Event Detail Page
File: `app/events/[slug]/page.tsx`

- Dynamic route, public (no auth required)
- Fetch event by slug
- Display all event data with nice formatting
- Show org name + link to org profile
- Call-to-action: "Visit Official Site" (if provided)
- Related events (same org, or similar tags)
- SEO: meta tags, JSON-LD schema

### 4.2 Create Org Profile Page
File: `app/organizations/[slug]/page.tsx`

- Dynamic route, public
- Fetch org by slug
- Display: name, logo, description, website
- List all their published events
- Link to org website if provided

### 4.3 Create All Events Page
File: `app/events/page.tsx`

- Display all published events
- Filters: date range, event type, city, tags, search
- Sorting: upcoming, featured, alphabetical
- Pagination
- Grid or list view

### 4.4 Create City Browse Page
File: `app/events/city/[city]/page.tsx`

- Optional: dynamic pages for each city
- List all events in that city
- Filter by date, type, etc.

### 4.5 Create Tag Browse Page
File: `app/events/tag/[tag]/page.tsx`

- Optional: dynamic pages for each tag
- List all events with that tag
- Show related tags

### 4.6 Create Homepage
File: `app/page.tsx`

- Update to show featured events
- "Browse all events" CTA
- "Create event" CTA (links to signup)
- Maybe upcoming events this weekend

### 4.7 Create Sitemap
File: `app/sitemap.xml/route.ts` (or `public/sitemap.xml`)

- All published events
- All org profiles
- Root pages
- Update frequency: events daily, orgs weekly

---

## Phase 5: Polish & Deploy
**Duration: 1 day**

### 5.1 Testing
- [ ] Org signup works
- [ ] Org login works
- [ ] Can create event
- [ ] Event appears on public site immediately
- [ ] Can edit event
- [ ] Can delete event
- [ ] Password recovery works
- [ ] All pages responsive
- [ ] SEO tags correct
- [ ] No console errors

### 5.2 Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
NEXT_PUBLIC_GA_ID= (optional)
```

### 5.3 Deploy to Vercel
- Push to GitHub
- Vercel auto-deploys
- Set environment variables in Vercel dashboard
- Test on production URL

### 5.4 Post-Launch
- Create first test org + event
- Monitor for bugs
- Add analytics
- Share signup link

---

## File Structure (After All Phases)

```
src/
├── app/
│   ├── page.tsx (home)
│   ├── auth/
│   │   └── org/
│   │       ├── signup/page.tsx
│   │       ├── login/page.tsx
│   │       └── reset-password/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx (org dashboard - protected)
│   │   └── events/
│   │       ├── create/page.tsx
│   │       └── [eventId]/page.tsx
│   ├── events/
│   │   ├── page.tsx (all events)
│   │   ├── [slug]/page.tsx (event detail)
│   │   ├── city/[city]/page.tsx (optional)
│   │   └── tag/[tag]/page.tsx (optional)
│   ├── organizations/
│   │   └── [slug]/page.tsx (org profile)
│   ├── api/
│   │   ├── auth/
│   │   │   └── org/
│   │   │       ├── signup/route.ts
│   │   │       ├── login/route.ts
│   │   │       ├── recover-password/route.ts
│   │   │       └── reset-password/route.ts
│   │   └── events/
│   │       ├── route.ts (CRUD)
│   │       └── [eventId]/route.ts
│   └── sitemap.xml/route.ts (optional)
├── components/
│   ├── auth/
│   │   ├── OrgSignupForm.tsx
│   │   ├── OrgLoginForm.tsx
│   │   └── PasswordRecoveryForm.tsx
│   ├── events/
│   │   ├── EventForm.tsx
│   │   ├── EventCard.tsx
│   │   ├── EventDetail.tsx
│   │   └── RichTextEditor.tsx (Tiptap)
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── authUtils.ts
│   ├── authMiddleware.ts
│   ├── supabase.ts
│   └── validation.ts
├── hooks/
│   └── useOrgAuth.ts
├── types/
│   ├── auth.ts
│   ├── event.ts
│   └── organization.ts
└── styles/
    └── globals.css
```

---

## Timeline Estimate

| Phase | Task | Days | Status |
|-------|------|------|--------|
| 1 | Branding removal | 1 | ✅ DONE |
| 2 | Database + Auth | 2 | 🔄 NEXT |
| 3 | Org dashboard + Event form | 2 | ⏳ TODO |
| 4 | Public discovery pages | 2 | ⏳ TODO |
| 5 | Testing + Deploy | 1 | ⏳ TODO |
| **TOTAL** | | **8 days** | |

---

## Next Steps

1. **Apply Supabase schema** (`ECKE_SUPABASE_SCHEMA.sql`)
2. **Start Phase 2** → Create org signup/login
3. Use Cursor with updated `.cursorrules`
4. Test org signup + login before moving to event form
5. Deploy when ready

---

## Key Decisions Locked In

✅ Self-contained Supabase (no kink.social sync)
✅ Self-signup organizations
✅ Auto-publish events (no approval)
✅ Username/password auth with email recovery
✅ All event types (Convention, Workshop, Dungeon, Social, Class, etc.)
✅ Rich text descriptions
✅ Image uploads (cover + gallery)
✅ Tags and filtering
✅ Org profiles + event detail pages

---

## What You Need to Provide

- [ ] Supabase project URL + API keys
- [ ] Domain name or Vercel URL
- [ ] Google Maps API key (optional, for location autocomplete)
- [ ] Email service (optional, for password recovery—Supabase functions or external service)
- [ ] File storage for images (Supabase Storage bucket)
