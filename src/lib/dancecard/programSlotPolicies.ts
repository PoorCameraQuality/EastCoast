import type { ProgramSlot } from '@/components/dancecard/attendee/program/types'

export type ProgramPolicyTone = 'amber' | 'rose' | 'sky' | 'violet'
export type ProgramPolicy = { key: string; label: string; tone: ProgramPolicyTone }

const PROGRAM_POLICY_RULES: Array<{ key: string; label: string; tone: ProgramPolicyTone; patterns: string[] }> = [
  { key: 'no-late-entry', label: 'No late entry', tone: 'amber', patterns: ['no late entry', 'no-late-entry', 'late entry not allowed'] },
  { key: 'no-reentry', label: 'No re-entry', tone: 'rose', patterns: ['no re-entry', 'no reentry', 're-entry not allowed', 'no ins and outs'] },
  { key: 'hard-start', label: 'Hard start', tone: 'sky', patterns: ['hard start', 'starts promptly', 'arrive early'] },
  { key: 'closed-door', label: 'Closed door', tone: 'violet', patterns: ['closed door', 'doors closed'] },
]

export function programPoliciesForSlots(slots: ProgramSlot[]): ProgramPolicy[] {
  const found = new Map<string, ProgramPolicy>()
  for (const slot of slots) {
    const text = `${slot.title} ${slot.description ?? ''} ${slot.trackDisplay ?? ''} ${slot.track ?? ''}`.toLowerCase()
    for (const rule of PROGRAM_POLICY_RULES) {
      if (rule.patterns.some((p) => text.includes(p))) {
        found.set(rule.key, { key: rule.key, label: rule.label, tone: rule.tone })
      }
    }
  }
  return Array.from(found.values())
}

export function policyChipClass(tone: ProgramPolicyTone): string {
  if (tone === 'amber') return 'border-amber-400/35 bg-amber-100 text-amber-900'
  if (tone === 'rose') return 'border-red-300 bg-red-100 text-red-800'
  if (tone === 'sky') return 'border-sky-400/35 bg-sky-500/15 text-sky-100'
  return 'border-violet-400/35 bg-violet-500/15 text-violet-800'
}
