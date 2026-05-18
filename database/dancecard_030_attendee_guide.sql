-- Dancecard 030: organizer-authored attendee guide + event profile preset.
ALTER TABLE dancecard_events
  ADD COLUMN IF NOT EXISTS attendee_guide_json jsonb NOT NULL DEFAULT '{}';

ALTER TABLE dancecard_events
  ADD COLUMN IF NOT EXISTS event_profile text NOT NULL DEFAULT 'camp';

ALTER TABLE dancecard_events
  DROP CONSTRAINT IF EXISTS dancecard_events_event_profile_check;

ALTER TABLE dancecard_events
  ADD CONSTRAINT dancecard_events_event_profile_check
  CHECK (event_profile IN ('camp', 'hotel', 'party', 'conference'));

COMMENT ON COLUMN dancecard_events.attendee_guide_json IS 'Public attendee guide: ticketingUrl, rabbitsignUrl, checkInMarkdown, sections[].';
COMMENT ON COLUMN dancecard_events.event_profile IS 'Vocabulary preset: camp, hotel, party, conference.';
