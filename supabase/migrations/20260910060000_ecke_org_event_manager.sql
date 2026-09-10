-- Additive organizer fields + posts/audit/members. Does not recreate public.events.

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_time text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_time text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS doors_open text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS show_address_publicly boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ticket_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_required boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ticket_price text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price_range text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_deadline date;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS age_restriction text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS accessibility text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS dress_code text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS photography_policy text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS parking text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS hotel_information text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS food_drink text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS vendor_area text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE TABLE IF NOT EXISTS public.event_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  role text NOT NULL CHECK (role IN ('owner', 'manager', 'contributor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.event_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_members_event_id ON public.event_members (event_id);
CREATE INDEX IF NOT EXISTS idx_event_members_user_id ON public.event_members (user_id);
CREATE INDEX IF NOT EXISTS idx_event_posts_event_id ON public.event_posts (event_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_audit_event_id ON public.event_audit_log (event_id, created_at DESC);

ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_audit_log ENABLE ROW LEVEL SECURITY;
