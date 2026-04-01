// Lightweight Core Web Vitals reporting without external deps
// Uses browser PerformanceObserver APIs to capture LCP, CLS, FID, TTFB

type Metric = { name: string; id: string; value: number }

function sendToGA(metric: Metric) {
  if (typeof window === 'undefined') return
  if (!(window as any).gaConsent) return
  const gtag = (window as any).gtag
  const GA_ID = (window as any).GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (!gtag || !GA_ID) return
  // Normalize values: CLS reported in thousandths to preserve precision
  const value = metric.name === 'CLS' ? Math.round(metric.value * 1000) : Math.round(metric.value)
  gtag('event', metric.name, { value, event_label: metric.id, non_interaction: true })
}

export function initWebVitals() {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return

  const idBase = `${Date.now()}-${Math.round(Math.random() * 1e6)}`

  // LCP
  try {
    let lcp = 0
    const po = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1] as any
      if (last && !document.hidden) {
        lcp = last.startTime
      }
    })
    po.observe({ type: 'largest-contentful-paint', buffered: true } as any)
    const report = () => {
      if (lcp) sendToGA({ name: 'LCP', id: `${idBase}-LCP`, value: lcp })
    }
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') report()
    })
    window.addEventListener('pagehide', report)
  } catch {}

  // CLS
  try {
    let cls = 0
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any) {
        if (!entry.hadRecentInput) {
          cls += entry.value
        }
      }
    })
    po.observe({ type: 'layout-shift', buffered: true } as any)
    const report = () => sendToGA({ name: 'CLS', id: `${idBase}-CLS`, value: cls })
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') report()
    })
    window.addEventListener('pagehide', report)
  } catch {}

  // FID (first-input) — legacy; Chrome may deprecate in favor of INP
  try {
    const po = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0] as any
      if (!entry) return
      const fid = entry.processingStart - entry.startTime
      sendToGA({ name: 'FID', id: `${idBase}-FID`, value: fid })
    })
    po.observe({ type: 'first-input', buffered: true } as any)
  } catch {}

  // INP proxy: worst interaction duration from Event Timing API (when interactionId is set)
  try {
    let worst = 0
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEventTiming & { interactionId?: number }
        if (e.interactionId && e.duration > worst) {
          worst = e.duration
        }
      }
    })
    po.observe({ type: 'event', buffered: true, durationThreshold: 0 } as PerformanceObserverInit)
    const report = () => {
      if (worst) sendToGA({ name: 'INP', id: `${idBase}-INP`, value: worst })
    }
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') report()
    })
    window.addEventListener('pagehide', report)
  } catch {}

  // TTFB
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (nav) {
      sendToGA({ name: 'TTFB', id: `${idBase}-TTFB`, value: nav.responseStart })
    }
  } catch {}
}


