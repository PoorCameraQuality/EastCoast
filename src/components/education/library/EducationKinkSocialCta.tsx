import EckeLink from '@/components/EckeLink'
import { ECKE_DISCORD_INVITE_URL, ECKE_DISCORD_LABEL } from '@/lib/eckeCommunity'

type Props = {
  compact?: boolean
}

export default function EducationKinkSocialCta({ compact = false }: Props) {
  return (
    <section className={`edu-platform-cta ${compact ? 'edu-platform-cta-compact' : ''}`} aria-labelledby="edu-ecke-cta">
      <h2 id="edu-ecke-cta" className="edu-platform-cta-title">
        Keep learning on ECKE
      </h2>
      <p className="edu-platform-cta-body">
        Browse public guides here. Questions or a guide to contribute? Reach the community on Discord or send a listing
        through an organization account.
      </p>
      <div className="edu-platform-cta-actions">
        <EckeLink href="/education" className="edu-btn-read">
          Browse education
        </EckeLink>
        <a
          href={ECKE_DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="edu-btn-save"
        >
          {ECKE_DISCORD_LABEL}
        </a>
      </div>
    </section>
  )
}
