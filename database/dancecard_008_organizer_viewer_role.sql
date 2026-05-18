-- Allow read-only organizer access (viewer) alongside owner/editor.
-- Apply after dancecard_004_organizers.sql (or any DB that already has dancecard_event_organizers).

ALTER TABLE dancecard_event_organizers DROP CONSTRAINT IF EXISTS dancecard_event_organizers_role_check;

ALTER TABLE dancecard_event_organizers
  ADD CONSTRAINT dancecard_event_organizers_role_check CHECK (role IN ('owner', 'editor', 'viewer'));
