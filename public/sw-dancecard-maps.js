/* Dancecard map image cache — install from map page only */
const CACHE = 'dancecard-maps-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = event.request.url
  if (event.request.method !== 'GET') return
  if (!url.includes('/storage/v1/object/sign/') && !url.includes('dancecard-maps')) return
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request)
      if (cached) return cached
      const res = await fetch(event.request)
      if (res.ok) cache.put(event.request, res.clone())
      return res
    }),
  )
})
