'use client'

import { useState } from 'react'

export default function OrgLogoutButton() {
  const [loading, setLoading] = useState(false)

  async function onClick() {
    setLoading(true)
    try {
      await fetch('/api/auth/org/logout', { method: 'POST' })
    } finally {
      window.location.assign('/auth/org/login')
    }
  }

  return (
    <button type="button" className="sf-btn-primary min-h-11 px-4" onClick={onClick} disabled={loading}>
      {loading ? 'Signing out…' : 'Log out'}
    </button>
  )
}
