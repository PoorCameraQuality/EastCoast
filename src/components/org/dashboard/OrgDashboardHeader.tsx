import EckeLink from '@/components/EckeLink'

type Props = {
  organizationName: string
  signedInAs: string
}

export default function OrgDashboardHeader({ organizationName, signedInAs }: Props) {
  return (
    <header className="org-dashboard-header">
      <div>
        <p className="org-dashboard-kicker">Dashboard</p>
        <h1 className="org-dashboard-title">{organizationName}</h1>
        <p className="org-dashboard-meta">
          Signed in as <strong>{signedInAs}</strong>
        </p>
        <p className="org-dashboard-lede">Manage your ECKE listings and public pages.</p>
      </div>
      <EckeLink href="/events/create" className="sf-btn-primary org-dashboard-primary">
        Create event
      </EckeLink>
    </header>
  )
}
