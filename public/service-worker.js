const CACHE_NAME = 'synced-shell-v3'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

// WebLLM manages its own model-weight storage via the Cache API and IndexedDB.
// Model shards are hundreds of megabytes across many files — never let the
// app shell cache intercept or duplicate them.
function isModelWeightRequest(request) {
  const url = new URL(request.url)
  return (
    url.hostname.endsWith('huggingface.co') ||
    url.hostname.endsWith('githubusercontent.com')
  )
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (isModelWeightRequest(event.request)) return

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy))
          return response
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        return response
      })
    }),
  )
})
