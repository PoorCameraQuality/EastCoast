-- Optional catalog table for future Supabase sync (static JSON remains source until migration).
-- Apply in Supabase SQL Editor before junction tables.

CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  website_url text,
  city text,
  state text,
  online_only boolean NOT NULL DEFAULT false,
  meta_title text,
  meta_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_state ON vendors (state);
CREATE INDEX IF NOT EXISTS idx_vendors_online ON vendors (online_only);
