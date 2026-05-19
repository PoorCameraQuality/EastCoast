-- Attendee groups: tent cities, hotel blocks, cabin crews, etc.

CREATE TABLE IF NOT EXISTS dancecard_attendee_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events(id) ON DELETE CASCADE,
  created_by_account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 4000),
  group_type text NOT NULL DEFAULT 'other'
    CHECK (group_type IN ('tent_city', 'hotel_block', 'cabin', 'other')),
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'unlisted')),
  join_mode text NOT NULL DEFAULT 'apply'
    CHECK (join_mode IN ('open', 'apply', 'invite_only')),
  recruitment_status text NOT NULL DEFAULT 'seeking'
    CHECK (recruitment_status IN ('open', 'seeking', 'full', 'closed')),
  capacity_min integer CHECK (capacity_min IS NULL OR capacity_min >= 0),
  capacity_max integer CHECK (capacity_max IS NULL OR capacity_max >= 1),
  expectations_md text NOT NULL DEFAULT '' CHECK (char_length(expectations_md) <= 8000),
  external_discord_url text,
  external_sheet_url text,
  invite_token text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'removed_by_mod')),
  curated_pin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dancecard_attendee_groups_invite_token
  ON dancecard_attendee_groups (event_id, invite_token);

CREATE INDEX IF NOT EXISTS idx_dancecard_attendee_groups_discover
  ON dancecard_attendee_groups (event_id, status, visibility, recruitment_status);

CREATE TABLE IF NOT EXISTS dancecard_attendee_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES dancecard_attendee_groups(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'left', 'removed')),
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dancecard_attendee_group_members_active
  ON dancecard_attendee_group_members (group_id, account_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_dancecard_attendee_group_members_account
  ON dancecard_attendee_group_members (account_id, status);

CREATE TABLE IF NOT EXISTS dancecard_attendee_group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES dancecard_attendee_groups(id) ON DELETE CASCADE,
  from_account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
  answers_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  message text NOT NULL DEFAULT '' CHECK (char_length(message) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dancecard_attendee_group_join_requests_pending
  ON dancecard_attendee_group_join_requests (group_id, from_account_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_dancecard_attendee_group_join_requests_group
  ON dancecard_attendee_group_join_requests (group_id, status);

CREATE TABLE IF NOT EXISTS dancecard_attendee_group_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES dancecard_attendee_groups(id) ON DELETE CASCADE,
  invited_account_id uuid REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  invited_email text,
  token text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  created_by_account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_dancecard_attendee_group_invites_token
  ON dancecard_attendee_group_invites (token);

CREATE TABLE IF NOT EXISTS dancecard_attendee_group_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES dancecard_attendee_groups(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  prompt text NOT NULL CHECK (char_length(prompt) >= 1 AND char_length(prompt) <= 500),
  kind text NOT NULL DEFAULT 'short_text'
    CHECK (kind IN ('short_text', 'long_text', 'single_choice', 'yes_no')),
  options_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  required boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_dancecard_attendee_group_questions_group
  ON dancecard_attendee_group_questions (group_id, sort_order);

CREATE TABLE IF NOT EXISTS dancecard_attendee_group_chores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES dancecard_attendee_groups(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  assigned_account_id uuid REFERENCES dancecard_accounts(id) ON DELETE SET NULL,
  done boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_by_account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dancecard_attendee_group_chores_group
  ON dancecard_attendee_group_chores (group_id, sort_order);

CREATE TABLE IF NOT EXISTS dancecard_attendee_group_bring_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES dancecard_attendee_groups(id) ON DELETE CASCADE,
  item_label text NOT NULL CHECK (char_length(item_label) >= 1 AND char_length(item_label) <= 200),
  quantity integer CHECK (quantity IS NULL OR quantity >= 1),
  claimed_by_account_id uuid REFERENCES dancecard_accounts(id) ON DELETE SET NULL,
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dancecard_attendee_group_bring_items_group
  ON dancecard_attendee_group_bring_items (group_id, created_at);

CREATE TABLE IF NOT EXISTS dancecard_attendee_group_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES dancecard_attendee_groups(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) >= 1 AND char_length(body) <= 2000),
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dancecard_attendee_group_announcements_group
  ON dancecard_attendee_group_announcements (group_id, pinned DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS dancecard_attendee_group_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES dancecard_attendee_groups(id) ON DELETE CASCADE,
  reporter_account_id uuid NOT NULL REFERENCES dancecard_accounts(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (char_length(reason) >= 1 AND char_length(reason) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dancecard_attendee_group_reports_group
  ON dancecard_attendee_group_reports (group_id, created_at DESC);
