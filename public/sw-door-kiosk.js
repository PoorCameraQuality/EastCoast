/* Door kiosk service worker — caches roster API responses for offline lookup. */
const CACHE = 'dancecard-door-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (!url.pathname.includes('/api/organizer/dancecard/') || !url.pathname.endsWith('/door/roster')) {
    return
  }
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const res = await fetch(event.request)
        if (res.ok) void cache.put(event.request, res.clone())
        return res
      } catch {
        const cached = await cache.match(event.request)
        if (cached) return cached
        throw new Error('offline')
      }
    }),
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'dancecard-door-checkin') {
    event.waitUntil(Promise.resolve())
  }
})
