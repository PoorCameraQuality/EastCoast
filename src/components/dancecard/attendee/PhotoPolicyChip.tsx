import { photoPolicyChipFromRaw } from '@/lib/dancecard/attendee/sessionPolicy'

export function PhotoPolicyChip({ policy }: { policy: unknown }) {
  const chip = photoPolicyChipFromRaw(policy)
  if (!chip) return null
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-dc-micro font-semibold uppercase tracking-wide ${chip.className}`}
    >
      {chip.label}
    </span>
  )
}
