const CACHE = 'suraksha-sathi-shell-v38';
const SHELL = [
  '/', '/index.html', '/css/styles.css?v=38', '/js/app.js?v=38', '/js/ar-engine.js?v=38',
  '/js/suraksha-sathi.js?v=38', '/js/modules/roof-strata.js?v=38', '/js/modules/gas-detector.js?v=38',
  '/js/modules/loto-drill.js?v=38', '/js/modules/dumper-blindspot.js?v=38',
  '/js/modules/scsr-donning.js?v=38', '/manifest.webmanifest', '/icons/mining-safety.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(response => {
      if (response.ok || response.type === 'opaque') caches.open(CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    })));
    return;
  }
  if (url.pathname.startsWith('/api/')) return;
  event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(request, response.clone()));
    return response;
  }).catch(() => request.mode === 'navigate' ? caches.match('/index.html') : Response.error())));
});
