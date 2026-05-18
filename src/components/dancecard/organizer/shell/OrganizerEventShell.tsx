'use client'

import { useState, type ReactNode } from 'react'
import { descriptionForTab, labelForTab, type OrganizerTab } from './organizerNavConfig'
import { OrganizerEventSidebar } from './OrganizerEventSidebar'
import { OrganizerEventHeader } from './OrganizerEventHeader'
import { cn } from '@/lib/cn'

type Props = {
  eventSlug: string
  eventTitle: string
  activeTab: OrganizerTab
  readOnly: boolean
  wideCanvas: boolean
  onSelectTab: (tab: OrganizerTab) => void
  onToggleWideCanvas: () => void
  onPreviewRole?: (role: 'attendee' | 'staff' | 'safety' | 'public') => void
  wideLayoutForTab: boolean
  children: ReactNode
}

export function OrganizerEventShell({
  eventSlug,
  eventTitle,
  activeTab,
  readOnly,
  wideCanvas,
  onSelectTab,
  onToggleWideCanvas,
  onPreviewRole,
  wideLayoutForTab,
  children,
}: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pageTitle = labelForTab(activeTab)
  const pageDescription = descriptionForTab(activeTab)

  return (
    <div className="relative flex min-h-[calc(100vh-3.25rem)] w-full">
      <OrganizerEventSidebar
        eventSlug={eventSlug}
        eventTitle={eventTitle}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
      />

      <div className="relative z-0 flex min-w-0 flex-1 flex-col">
        <OrganizerEventHeader
          eventSlug={eventSlug}
          readOnly={readOnly}
          wideCanvas={wideCanvas}
          onOpenMenu={() => setMobileNavOpen(true)}
          onToggleWideCanvas={onToggleWideCanvas}
          onPreviewRole={onPreviewRole}
        />

        <main
          className={cn(
            'flex-1 px-4 py-6 sm:px-6 lg:py-8',
            wideCanvas && wideLayoutForTab
              ? 'max-w-[min(100%,1600px)]'
              : activeTab === 'people' ||
                  activeTab === 'registrants' ||
                  activeTab === 'import' ||
                  activeTab === 'staff'
                ? 'max-w-[min(100%,1400px)]'
                : 'max-w-5xl',
          )}
        >
          {activeTab !== 'dashboard' ? (
            <header className="mb-6 border-b border-dc-border pb-5">
              <h1 className="font-serif text-2xl text-dc-text sm:text-3xl">{pageTitle}</h1>
              {pageDescription ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dc-muted">{pageDescription}</p> : null}
            </header>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  )
}
