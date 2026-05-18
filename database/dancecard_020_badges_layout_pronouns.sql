-- Phase 4 P4.6 — badge layout JSON on event + optional pronouns on registrant for print/badge.
-- Apply after dancecard_019_registrant_vetting_safety_role.sql.

ALTER TABLE dancecard_events ADD COLUMN IF NOT EXISTS badge_layout_json jsonb NOT NULL DEFAULT '{}';

ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS pronouns text;

COMMENT ON COLUMN dancecard_events.badge_layout_json IS 'Organizer badge template: fonts, show fields, category stripe colors, etc.';
