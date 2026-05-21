import { cn } from '@/lib/cn'

export type AvailSlotKind = 'open' | 'busy' | 'claimed'

export function availSlotKind(row: { busy: boolean; title: string }): AvailSlotKind {
  if (!row.busy) return 'open'
  if (row.title.startsWith('Claimed by')) return 'claimed'
  return 'busy'
}

const SLOT_BASE =
  'rounded-lg border text-left text-xs transition motion-reduce:transition-none'

/** Calendar / availability hour rows — uses `--dc-avail-*` theme tokens. */
export function availabilitySlotClasses(
  row: { busy: boolean; title: string },
  layout: 'day-grid' | 'day-grid-compact' | 'hour-flex' = 'day-grid',
): string {
  const kind = availSlotKind(row)
  const layoutCls =
    layout === 'hour-flex'
      ? 'flex w-full min-h-10 items-center justify-between px-2.5 py-2'
      : layout === 'day-grid-compact'
        ? 'grid w-full min-h-10 grid-cols-[84px_minmax(0,1fr)] items-center gap-2 px-2 py-1.5'
        : 'grid w-full min-h-touch grid-cols-[98px_minmax(0,1fr)] items-center gap-2 px-2.5 py-2'

  return cn(
    SLOT_BASE,
    layoutCls,
    'dc-avail-slot',
    kind === 'open' && 'dc-avail-slot--open active:scale-[0.99] motion-reduce:active:scale-100',
    kind === 'busy' && 'dc-avail-slot--busy',
    kind === 'claimed' && 'dc-avail-slot--claimed',
  )
}
