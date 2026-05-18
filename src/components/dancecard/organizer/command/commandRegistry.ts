import type { OrganizerTab } from '@/components/dancecard/organizer/shell/organizerNavConfig'
import { SETUP_TASKS } from '@/lib/dancecard/setupTasks'

export type CommandContext = {
  eventSlug: string
  switchTab: (tab: OrganizerTab) => void
  openConflicts?: () => void
  openSetupTask?: (taskId: string) => void
  openDraftProgram?: () => void
  copyAttendeeUrl?: () => void
  previewRole?: (role: 'attendee' | 'staff' | 'safety' | 'public') => void
}

export type CommandItem = {
  id: string
  group: string
  label: string
  keywords?: string
  shortcut?: string
  run: (ctx: CommandContext) => void
}

export function buildOrganizerCommands(ctx: CommandContext): CommandItem[] {
  const slug = ctx.eventSlug.toLowerCase()
  const setupCommands: CommandItem[] = SETUP_TASKS.filter((t) => t.group === 'essential').map((task) => ({
    id: `setup-${task.id}`,
    group: 'Setup',
    label: task.label,
    keywords: `setup task ${task.description}`,
    run: () => ctx.openSetupTask?.(task.id),
  }))

  return [
    { id: 'go-dashboard', group: 'Navigate', label: 'Go to Home', run: () => ctx.switchTab('dashboard') },
    { id: 'go-program', group: 'Navigate', label: 'Go to Program', shortcut: 'G P', run: () => ctx.switchTab('program') },
    { id: 'go-people', group: 'Navigate', label: 'Go to People', run: () => ctx.switchTab('people') },
    { id: 'go-settings', group: 'Navigate', label: 'Go to Event settings', run: () => ctx.switchTab('settings') },
    { id: 'go-import', group: 'Navigate', label: 'Go to Import', run: () => ctx.switchTab('import') },
    { id: 'go-integrations', group: 'Navigate', label: 'Go to Integrations', run: () => ctx.switchTab('integrations') },
    { id: 'go-exports', group: 'Navigate', label: 'Go to Exports', run: () => ctx.switchTab('exports') },
    { id: 'go-messaging', group: 'Navigate', label: 'Go to Messaging', run: () => ctx.switchTab('messaging') },
    ...setupCommands,
    {
      id: 'open-draft-program',
      group: 'Program',
      label: 'Show unpublished classes',
      keywords: 'draft publish program',
      run: () => ctx.openDraftProgram?.(),
    },
    {
      id: 'open-conflicts',
      group: 'Program',
      label: 'Open conflict dock',
      keywords: 'overlap scan conflicts',
      run: () => ctx.openConflicts?.(),
    },
    {
      id: 'copy-attendee',
      group: 'Share',
      label: 'Copy attendee link',
      run: () => {
        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/dancecard/${slug}`
        void navigator.clipboard.writeText(url)
        ctx.copyAttendeeUrl?.()
      },
    },
    {
      id: 'preview-attendee',
      group: 'Preview',
      label: 'Preview as attendee',
      run: () => ctx.previewRole?.('attendee'),
    },
    {
      id: 'preview-staff',
      group: 'Preview',
      label: 'Preview as staff',
      run: () => ctx.previewRole?.('staff'),
    },
    {
      id: 'preview-safety',
      group: 'Preview',
      label: 'Preview as safety',
      run: () => ctx.previewRole?.('safety'),
    },
    {
      id: 'shortcuts',
      group: 'Help',
      label: 'Keyboard shortcuts',
      shortcut: '?',
      run: () => {
        window.dispatchEvent(new CustomEvent('dc-organizer-show-shortcuts'))
      },
    },
  ]
}
