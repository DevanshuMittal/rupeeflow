/* ============================================================================
   RupeeFlow service worker
   - pre-caches the app shell so it opens with no network
   - NETWORK-FIRST for the app document, so a new deploy shows up immediately
   - never caches Google API / identity traffic
   BUILD is kept in sync with index.html by tools/bump.js
   ========================================================================== */
const BUILD = '1.4.3+2026-09-16.1';
const CACHE = 'rupeeflow-' + BUILD;
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './setup-check.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

const isAppDocument = (req, url) =>
  req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  /* Google APIs / identity must always be live, never cached */
  if (/googleapis\.com|accounts\.google\.com|gstatic\.com|googleusercontent\.com/.test(url.host)) return;
  if (url.origin !== location.origin) return;

  if (isAppDocument(e.request, url)) {
    /* network-first: new deploys appear on the next open (4s offline fallback) */
    e.respondWith((async () => {
      try {
        const fresh = await Promise.race([
          fetch(e.request, { cache: 'no-store' }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000))
        ]);
        const copy = fresh.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => {});
        return fresh;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./')) ||
          new Response('<h1>RupeeFlow is offline</h1><p>Reconnect once and it will work offline again.</p>',
            { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  /* everything else: cache-first, refreshed in the background */
  e.respondWith((async () => {
    const hit = await caches.match(e.request);
    const net = fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => null);
    return hit || (await net) || new Response('', { status: 504 });
  })());
});
