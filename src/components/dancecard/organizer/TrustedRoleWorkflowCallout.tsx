'use client'

type Variant = 'applications' | 'coverage'

export function TrustedRoleWorkflowCallout({
  eventSlug,
  variant,
}: {
  eventSlug: string
  variant: Variant
}) {
  const applicationsHref = `/organizer/dancecard/${eventSlug}?tab=people&peopleTab=applications`
  const staffHref = `/organizer/dancecard/${eventSlug}?tab=people&peopleTab=staff`

  return (
    <div className="rounded-xl border border-dc-accent-border/45 bg-dc-accent-muted/25 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-dc-accent">Trusted role workflow</p>
      {variant === 'applications' ? (
        <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
          <span className="font-medium text-white">1.</span> Approve applicants below ·{' '}
          <span className="font-medium text-white">2.</span> Assign shifts on{' '}
          <a className="font-semibold text-dc-accent underline hover:text-dc-accent-hover" href={staffHref}>
            People → Staff shifts
          </a>{' '}
          · <span className="font-medium text-white">3.</span> Fill gaps on{' '}
          <a className="text-dc-accent underline hover:text-dc-accent-hover" href={`/organizer/dancecard/${eventSlug}?tab=people&peopleTab=coverage`}>
            Coverage & assignments
          </a>
        </p>
      ) : (
        <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
          Coverage uses shifts from{' '}
          <a className="font-semibold text-dc-accent underline hover:text-dc-accent-hover" href={staffHref}>
            People → Staff shifts
          </a>
          . For trusted roles, approve on{' '}
          <a className="text-dc-accent underline hover:text-dc-accent-hover" href={applicationsHref}>
            Special roles & applications
          </a>{' '}
          first, then assign DM / coverage shifts there.
        </p>
      )}
    </div>
  )
}
