const CACHE_NAME = 'eduflow-os-v2'

const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/icon.svg',
  '/apple-icon.png',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
]

const AUTH_AND_PROTECTED_ROUTES = [
  '/login',
  '/admin',
  '/super-admin',
  '/teacher',
  '/parent',
  '/api',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Bypass service worker cache for API requests and auth/protected pages
  const isProtectedOrAuth = AUTH_AND_PROTECTED_ROUTES.some(
    (route) => url.pathname === route || url.pathname.startsWith(`${route}/`)
  )

  if (isProtectedOrAuth || url.pathname.startsWith('/_next/data/')) {
    // Always use network with redirect follow for protected routes & middleware navigation
    event.respondWith(
      fetch(request, { redirect: 'follow' }).catch(() => {
        return new Response('Network error or offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        })
      })
    )
    return
  }

  // Navigation requests: Network-first to prevent stale redirects
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { redirect: 'follow' }).catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        return (await caches.match('/')) || new Response('Offline', { status: 503 })
      })
    )
    return
  }

  // Static assets: Cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request, { redirect: 'follow' }).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
        }
        return response
      })
    })
  )
})
