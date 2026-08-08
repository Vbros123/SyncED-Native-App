const CACHE_VERSION = 'v6'
const SHELL_CACHE = `synced-shell-${CACHE_VERSION}`
const RUNTIME_CACHE = `synced-runtime-${CACHE_VERSION}`
const STATIC_CACHE = `synced-static-${CACHE_VERSION}`
const OWNED_CACHE_PREFIXES = ['synced-shell-', 'synced-runtime-', 'synced-static-']
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const currentCaches = new Set([SHELL_CACHE, RUNTIME_CACHE, STATIC_CACHE])
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => OWNED_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)) && !currentCaches.has(key)).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

function isApiRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/')
}

function isStaticRequest(request) {
  return ['style', 'script', 'font', 'image'].includes(request.destination)
}

async function navigationResponse(request) {
  try {
    const network = await fetch(request)
    if (network.ok) {
      const cache = await caches.open(SHELL_CACHE)
      eventSafePut(cache, '/index.html', network.clone())
    }
    return network
  } catch {
    const cached = await caches.match('/index.html')
    if (cached) return cached
    return new Response('<!doctype html><html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>SyncED offline</title><style>body{font-family:system-ui;margin:0;display:grid;min-height:100vh;place-items:center;background:#f4f7fb;color:#14213d}main{max-width:34rem;padding:2rem}h1{font-size:1.8rem}button{padding:.8rem 1rem;border:0;border-radius:.6rem;background:#0757e6;color:#fff;font-weight:700}</style><main><p>SyncED offline</p><h1>This screen is not cached yet.</h1><p>Reconnect once and open SyncED so the app can prepare this device for offline use. Your previously saved work has not been removed.</p><button onclick="location.reload()">Try again</button></main></html>', { headers: { 'content-type': 'text/html; charset=utf-8' }, status: 503 })
  }
}

function eventSafePut(cache, request, response) {
  if (response && response.ok && response.type !== 'opaque') cache.put(request, response).catch(() => {})
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  const networkPromise = fetch(request).then(async (response) => {
    if (response.ok && response.type !== 'opaque') {
      const cache = await caches.open(isStaticRequest(request) ? STATIC_CACHE : RUNTIME_CACHE)
      eventSafePut(cache, request, response.clone())
    }
    return response
  }).catch(() => null)
  return cached || networkPromise || new Response('Content is unavailable offline.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (isApiRequest(request)) {
    event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ error: 'Offline' }), { status: 503, headers: { 'content-type': 'application/json' } })))
    return
  }
  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request))
    return
  }
  event.respondWith(staleWhileRevalidate(request))
})

self.addEventListener('sync', (event) => {
  if (event.tag !== 'synced-activity-queue') return
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => client.postMessage({ type: 'PROCESS_SYNC_QUEUE' }))
  }))
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (event.data?.type === 'TEST_CACHE_UPGRADE') {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => OWNED_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)) && ![SHELL_CACHE, RUNTIME_CACHE, STATIC_CACHE].includes(key)).map((key) => caches.delete(key)))))
  }
})
