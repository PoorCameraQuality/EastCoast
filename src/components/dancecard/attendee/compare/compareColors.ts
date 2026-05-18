/**
 * Compare / mutual availability — legend + strips share these classes.
 * Sage green, rose busy, royal blue host-only, charcoal outside, gold selected.
 */

export const compareSlot = {
  mutualFree: 'bg-dc-compare-mutual',
  mutualFreeHover:
    'hover:brightness-110 hover:ring-2 hover:ring-dc-success/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-dc-accent',
  hostFreeOnly: 'bg-dc-compare-host-only ring-1 ring-dc-compare-host-only-ring',
  busy: 'bg-dc-compare-busy ring-1 ring-dc-compare-busy-ring',
  outsideWindow: 'bg-dc-compare-outside border border-black/50',
  selectedGap: 'border-2 border-dashed border-dc-accent bg-dc-compare-selected',
} as const

export const compareLegendSwatch = {
  mutualFree: 'bg-dc-compare-mutual ring-1 ring-dc-success/50',
  hostFreeOnly: 'bg-dc-compare-host-only ring-1 ring-dc-compare-host-only-ring',
  busy: 'bg-dc-compare-busy ring-1 ring-dc-compare-busy-ring',
  outsideWindow: 'bg-dc-compare-outside ring-1 ring-black/40',
  selectedGap: 'border-2 border-dashed border-dc-accent bg-dc-compare-selected',
} as const

/** Diagonal hatch on busy legend swatch (color-blind cue). */
export const compareLegendBusyHatchStyle = {
  backgroundImage:
    'repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0.22) 4px)',
} as const

export const compareConstellationSegment = {
  mutual: 'bg-dc-compare-mutual ring-2 ring-dc-success/60',
  hostFreeOnly: 'bg-dc-compare-host-only ring-1 ring-dc-compare-host-only-ring',
  hostFree: 'bg-dc-compare-mutual opacity-80',
  busy: 'bg-dc-compare-busy ring-1 ring-dc-compare-busy-ring',
} as const
