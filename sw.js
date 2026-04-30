/*
 * The List — service worker
 *
 * WHY: Makes the site installable as a PWA and usable offline on the home
 * screen. Strategy is "network-first with cache fallback" for the app shell
 * — if you're online you always get the latest version (important because
 * I push updates to this repo a lot); if you're offline the cached copy
 * loads so the app still opens.
 *
 * CACHE VERSION: bump CACHE when the app shell changes in a way that
 * needs to be picked up immediately. Old caches are purged on activate.
 *
 * NOTE: once we migrate to Supabase, API calls bypass this worker (they
 * hit supabase.co, not the same origin), so we don't need to worry about
 * stale data in the cache affecting task state.
 */

const CACHE = 'thelist-v15';
const SHELL = [
  './',
  './index.html',
  './config.js',
  './favicon.svg',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Only handle same-origin requests. External (fonts, Supabase, etc.) pass through.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((resp) => {
        // Update cache in the background
        const copy = resp.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
