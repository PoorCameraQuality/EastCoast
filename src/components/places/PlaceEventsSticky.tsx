'use client'

import { useEffect, useState } from 'react'
import EckeLink from '@/components/EckeLink'

export default function PlaceEventsSticky() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('place-profile-hero')
    const events = document.getElementById('events-here')
    if (!hero || !events) return undefined

    const mobile = window.matchMedia('(max-width: 767px)')

    const update = () => {
      if (!mobile.matches) {
        setVisible(false)
        return
      }
      const heroGone = hero.getBoundingClientRect().bottom < 72
      const eventsBox = events.getBoundingClientRect()
      const eventsInView = eventsBox.top < window.innerHeight * 0.78 && eventsBox.bottom > 96
      setVisible(heroGone && !eventsInView)
    }

    update()
    const observer = new IntersectionObserver(update, { threshold: [0, 0.2, 0.6, 1] })
    observer.observe(hero)
    observer.observe(events)
    mobile.addEventListener('change', update)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      mobile.removeEventListener('change', update)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="place-sticky-events">
      <EckeLink href="#events-here" className="place-sticky-events-link">
        View upcoming events
      </EckeLink>
    </div>
  )
}
