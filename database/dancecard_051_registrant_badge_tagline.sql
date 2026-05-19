-- Badge print: optional custom line per registrant (attendee-editable).
ALTER TABLE dancecard_registrants ADD COLUMN IF NOT EXISTS badge_tagline text;

COMMENT ON COLUMN dancecard_registrants.badge_tagline IS 'Short line printed on attendee badge (self-service or organizer-edited).';
