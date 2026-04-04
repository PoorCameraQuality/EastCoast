"use client"
import Script from 'next/script'
import { useEffect, useState, Suspense } from 'react'
import { initWebVitals } from '@/lib/web-vitals'
import { usePathname, useSearchParams } from 'next/navigation'
import { markGaConsentGranted } from '@/lib/analyticsEntities'

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string
}

function GoogleAnalyticsInner({ GA_MEASUREMENT_ID }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || GA_MEASUREMENT_ID
  const [loadScripts, setLoadScripts] = useState(false)
  const [gtagJsLoaded, setGtagJsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    markGaConsentGranted()
    setLoadScripts(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !loadScripts || !gtagJsLoaded) return
    if (!(window as any).gaConsent) return
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    if ((window as any).gtag) {
      ;(window as any).gtag('config', GA_ID, {
        page_path: url,
      })
    }
    initWebVitals()
  }, [pathname, searchParams, GA_ID, loadScripts, gtagJsLoaded])

  return (
    <>
      {loadScripts && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
            onLoad={() => setGtagJsLoaded(true)}
          />
          {gtagJsLoaded && (
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
              }}
            />
          )}
        </>
      )}
    </>
  )
}

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: GoogleAnalyticsProps) {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
    </Suspense>
  )
}

// Custom hook for tracking events
export const useGoogleAnalytics = () => {
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  }

  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
      })
    }
  }

  return { trackEvent, trackPageView }
}
