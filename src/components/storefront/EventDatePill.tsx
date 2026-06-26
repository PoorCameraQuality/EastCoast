import { formatEventDatePill } from '@/components/storefront/eventDateBlock'

type Props = {
  start: string
  end: string
  display: string
  className?: string
}

export default function EventDatePill({ start, end, display, className = '' }: Props) {
  return (
    <span className={`event-date-pill ${className}`.trim()}>{formatEventDatePill(start, end, display)}</span>
  )
}
