'use client'

import { ORGANIZER_PUBLISHED_AS_HINT, ORGANIZER_PUBLISHED_AS_LABEL } from '@/lib/dancecard/organizerCopy'
import { Panel } from '@/components/dancecard/ui/Panel'
import {
  SETTINGS_FIELD_CLASS,
  SETTINGS_LABEL_CLASS,
} from '@/components/dancecard/organizer/settings/eventSettingsConfig'
import type { EventSettingsEventDto } from '@/components/dancecard/organizer/settings/EventSettingsEventDto'

type Props = {
  event: EventSettingsEventDto
  setEvent: React.Dispatch<React.SetStateAction<EventSettingsEventDto | null>>
  canEdit: boolean
  saveOnBlur: (patch: Partial<EventSettingsEventDto>) => void
  embedded?: boolean
}

function BrandingFields({ event, setEvent, canEdit, saveOnBlur }: Props) {
  return (
    <>
      <label className={SETTINGS_LABEL_CLASS}>
        {ORGANIZER_PUBLISHED_AS_LABEL}
        <input
          className={SETTINGS_FIELD_CLASS}
          value={event.productTitle}
          disabled={!canEdit}
          onChange={(e) => setEvent((ev) => (ev ? { ...ev, productTitle: e.target.value } : ev))}
          onBlur={() => saveOnBlur({ productTitle: event.productTitle })}
        />
        <span className="mt-1 block text-xs font-normal normal-case text-dc-muted">{ORGANIZER_PUBLISHED_AS_HINT}</span>
      </label>
      <label className={SETTINGS_LABEL_CLASS}>
        Subtitle (optional)
        <input
          className={SETTINGS_FIELD_CLASS}
          value={event.subtitle ?? ''}
          disabled={!canEdit}
          onChange={(e) => setEvent((ev) => (ev ? { ...ev, subtitle: e.target.value || null } : ev))}
          onBlur={() => saveOnBlur({ subtitle: event.subtitle })}
          placeholder="A weekend of rope, community, and play"
        />
      </label>
      <label className={SETTINGS_LABEL_CLASS}>
        Presented by (label)
        <input
          className={SETTINGS_FIELD_CLASS}
          value={event.sharedByLabel}
          disabled={!canEdit}
          onChange={(e) => setEvent((ev) => (ev ? { ...ev, sharedByLabel: e.target.value } : ev))}
          onBlur={() => saveOnBlur({ sharedByLabel: event.sharedByLabel })}
          placeholder="Presented by Your Collective"
        />
      </label>
      <label className={SETTINGS_LABEL_CLASS}>
        Logo URL (optional)
        <input
          className={SETTINGS_FIELD_CLASS}
          value={event.logoUrl ?? ''}
          disabled={!canEdit}
          onChange={(e) => setEvent((ev) => (ev ? { ...ev, logoUrl: e.target.value || null } : ev))}
          onBlur={() => saveOnBlur({ logoUrl: event.logoUrl })}
          placeholder="https://..."
        />
      </label>
    </>
  )
}

export function EventSettingsBrandingForm(props: Props) {
  const grid = 'grid gap-4'
  if (props.embedded) {
    return (
      <div className={grid}>
        <BrandingFields {...props} />
      </div>
    )
  }
  return (
    <Panel className={grid}>
      <BrandingFields {...props} />
    </Panel>
  )
}
