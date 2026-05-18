'use client'

type Props = {
  fromLabel: string
  toLabel: string
  minutesEstimate?: number
}

export function WalkingTimeWhisper({ fromLabel, toLabel, minutesEstimate = 4 }: Props) {
  if (!fromLabel || !toLabel || fromLabel === toLabel) return null

  return (
    <p className="text-dc-micro text-dc-muted" role="note">
      ~{minutesEstimate} min walk from <span className="text-dc-text">{fromLabel}</span> to{' '}
      <span className="text-dc-text">{toLabel}</span>
    </p>
  )
}
