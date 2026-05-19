CREATE TABLE IF NOT EXISTS dancecard_iso_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'organizers_only', 'hidden')),
  contact_reveal text NOT NULL DEFAULT 'on_interest'
    CHECK (contact_reveal IN ('on_interest', 'never')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'filled', 'withdrawn')),
  curated_pin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dancecard_iso_posts_event_visible
  ON dancecard_iso_posts (event_id, status, visibility);

CREATE TABLE IF NOT EXISTS dancecard_iso_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso_post_id uuid NOT NULL REFERENCES dancecard_iso_posts(id) ON DELETE CASCADE,
  from_account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (iso_post_id, from_account_id)
);
