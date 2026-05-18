import { Panel } from '@/components/dancecard/ui/Panel'
import { Button } from '@/components/dancecard/ui/Button'

type Props = {
  message: string
  onRetry?: () => void
  offlineHint?: boolean
}

export function GateTrustPanel({ message, onRetry, offlineHint = false }: Props) {
  return (
    <Panel variant="muted" className="border-dc-warning/30">
      <p className="text-sm font-semibold text-dc-text">
        {offlineHint ? 'Connection problem' : 'Could not verify access'}
      </p>
      <p className="mt-2 text-sm text-dc-muted">{message}</p>
      {offlineHint ? (
        <p className="mt-2 text-dc-micro text-dc-muted">
          Your data may be out of date. Retry when you have signal — we will not pretend you are signed in.
        </p>
      ) : null}
      {onRetry ? (
        <Button type="button" variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </Panel>
  )
}
