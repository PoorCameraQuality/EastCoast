-- Attendee public profile on dancecard prefs + organizer field toggles on events.

ALTER TABLE dancecard_prefs
  ADD COLUMN IF NOT EXISTS profile_json jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE dancecard_events
  ADD COLUMN IF NOT EXISTS attendee_profile_config jsonb NOT NULL DEFAULT jsonb_build_object(
    'photo', true,
    'bio', true,
    'pronouns', true,
    'fetlife', true,
    'discord', true,
    'telegram', false,
    'emailOnCard', false,
    'bioMaxLength', 280,
    'bioPrompt', null
  );

COMMENT ON COLUMN dancecard_prefs.profile_json IS
  'Attendee-editable public card: pronouns, bio, photoUrl, fetlife, discord, telegram, emailOnCard.';

COMMENT ON COLUMN dancecard_events.attendee_profile_config IS
  'Organizer toggles for which profile fields attendees may fill on their dancecard.';
