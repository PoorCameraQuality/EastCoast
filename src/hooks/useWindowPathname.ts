'use client'

import { useEffect, useState } from 'react'

/** Pathname without next/navigation — safe when the App Router context is missing. */
export function useWindowPathname() {
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname)
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  return pathname
}

export function useWindowSearch() {
  const [search, setSearch] = useState('')

  useEffect(() => {
    const sync = () => setSearch(window.location.search.replace(/^\?/, ''))
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  return search
}
