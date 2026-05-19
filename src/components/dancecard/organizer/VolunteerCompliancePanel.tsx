'use client'

import { useCallback, useEffect, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { Panel } from '@/components/dancecard/ui/Panel'

type Row = {
  registrantId: string
  displayName: string
  categoryName: string
  expectedHours: number
  claimedHours: number
  deficitHours: number
}

export function VolunteerCompliancePanel({ eventSlug }: { eventSlug: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await organizerDancecardFetch<{ rows: Row[] }>(eventSlug, '/volunteer-compliance')
      setRows(d.rows ?? [])
      setErr(null)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load compliance')
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <Panel className="space-y-3 p-4">
      <h3 className="font-serif text-lg text-dc-text">Volunteer compliance</h3>
      <p className="text-xs text-dc-muted">Registrants below required hours for their category (from claimed staff shifts).</p>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      {rows.length === 0 ? (
        <p className="text-sm text-dc-muted">Everyone meets required hours, or no categories define expected hours.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-dc-muted">
              <th className="py-1">Name</th>
              <th>Category</th>
              <th>Required</th>
              <th>Claimed</th>
              <th>Deficit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.registrantId} className="border-t border-dc-border">
                <td className="py-2 font-medium text-dc-text">{r.displayName}</td>
                <td>{r.categoryName}</td>
                <td>{r.expectedHours}h</td>
                <td>{r.claimedHours}h</td>
                <td className="text-amber-800">{r.deficitHours}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Panel>
  )
}
