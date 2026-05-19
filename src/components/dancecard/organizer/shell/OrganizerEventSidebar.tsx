'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ORGANIZER_SIDEBAR_SECTIONS,
  type OrganizerTab,
} from '@/components/dancecard/organizer/shell/organizerNavConfig'
import { cn } from '@/lib/cn'

type Props = {
  eventSlug: string
  eventTitle: string
  activeTab: OrganizerTab
  onSelectTab: (tab: OrganizerTab) => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

function defaultExpandedSections(): Record<string, boolean> {
  const init: Record<string, boolean> = {}
  for (const section of ORGANIZER_SIDEBAR_SECTIONS) {
    init[section.id] = true
  }
  return init
}

export function OrganizerEventSidebar({
  eventSlug,
  eventTitle,
  activeTab,
  onSelectTab,
  mobileOpen,
  onMobileOpenChange,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(defaultExpandedSections)

  const activeSectionId = useMemo(() => {
    for (const section of ORGANIZER_SIDEBAR_SECTIONS) {
      if (section.items.some((i) => i.key === activeTab)) return section.id
    }
    return 'home'
  }, [activeTab])

  useEffect(() => {
    setExpanded((prev) => ({ ...prev, [activeSectionId]: true }))
  }, [activeSectionId])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onMobileOpenChange])

  const toggleSection = useCallback((sectionId: string) => {
    setExpanded((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }, [])

  const title = eventTitle || eventSlug

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-dc-surface/80 md:hidden"
          aria-label="Close menu"
          onClick={() => onMobileOpenChange(false)}
        />
      ) : null}

      <aside
        className={cn(
          'flex w-[17rem] shrink-0 flex-col border-r border-dc-border bg-dc-surface-muted',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:shadow-2xl',
          'max-md:transition-transform max-md:duration-200',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:pointer-events-none max-md:-translate-x-full',
          'md:relative md:z-20 md:translate-x-0 md:pointer-events-auto',
        )}
        aria-label="Event navigation"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-4">
          <div className="mb-4 px-3">
            <Link
              href="/organizer/dancecard"
              className="text-xs font-medium text-dc-accent hover:text-dc-accent-hover"
            >
              ← All events
            </Link>
            <p className="mt-3 font-serif text-lg leading-snug text-dc-text">{title}</p>
            <p className="mt-1 font-mono text-xs text-dc-muted">{eventSlug}</p>
          </div>

          <nav className="flex-1 space-y-1" aria-label="Event sections">
            {ORGANIZER_SIDEBAR_SECTIONS.map((section) => {
              const isOpen = expanded[section.id] ?? true
              const sectionActive = section.id === activeSectionId
              const single = section.items.length === 1 ? section.items[0] : null
              return (
                <div key={section.id} className="rounded-lg">
                  {single ? (
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition',
                        single.key === activeTab
                          ? 'bg-dc-accent-muted text-dc-accent'
                          : sectionActive
                            ? 'text-dc-accent'
                            : 'text-dc-muted hover:bg-dc-elevated-muted/80 hover:text-dc-text',
                      )}
                      aria-current={single.key === activeTab ? 'page' : undefined}
                      onClick={() => {
                        onSelectTab(single.key)
                        onMobileOpenChange(false)
                      }}
                    >
                      {section.label}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide',
                          sectionActive ? 'text-dc-accent' : 'text-dc-muted hover:text-dc-text',
                        )}
                        aria-expanded={isOpen}
                        onClick={() => toggleSection(section.id)}
                      >
                        <span>{section.label}</span>
                        <span className="text-[10px] opacity-70" aria-hidden>
                          {isOpen ? '▾' : '▸'}
                        </span>
                      </button>
                      {isOpen ? (
                        <ul className="mt-0.5 space-y-0.5 pb-2">
                          {section.items.map((item) => {
                            const active = item.key === activeTab
                            return (
                              <li key={item.key}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectTab(item.key)
                                    onMobileOpenChange(false)
                                  }}
                                  className={cn(
                                    'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition',
                                    active
                                      ? 'bg-dc-accent-muted text-dc-accent'
                                      : 'text-dc-muted hover:bg-dc-elevated-muted/80 hover:text-dc-text',
                                  )}
                                  aria-current={active ? 'page' : undefined}
                                >
                                  {item.label}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      ) : null}
                    </>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="mt-4 border-t border-dc-border px-3 pt-4">
            <Link
              href={`/dancecard/${eventSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dc-muted hover:text-dc-accent"
            >
              Open public dancecard ↗
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
