/**
 * ==============================================================================
 * HUMU KABBA VARIETY VAULT — SERVICE WORKER
 * Strategy: Cache-First for core assets; Network-First for API/dynamic data
 * Offline fallback: offline.html
 * ==============================================================================
 */

const CACHE_NAME = 'hk-vault-v3';
const OFFLINE_URL = '/offline.html';

// Core shell assets — always cached on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/shop.html',
  '/cart.html',
  '/track.html',
  '/offline.html',
  '/styles.css',
  '/script.js',
  '/config.js',
  '/manifest.webmanifest',
  '/assets/logo.jpg',
  '/assets/bags.jpg',
  '/assets/beauty.jpg',
  '/assets/dresses.jpg',
  '/assets/shoes.jpg',
  '/assets/cases/crystal_shell.jpg',
  '/assets/cases/heart_shell.jpg',
];

// ============================================================
//  INSTALL — cache core assets
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).then(() => self.skipWaiting())
  );
});

// ============================================================
//  ACTIVATE — delete old caches
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ============================================================
//  FETCH — smart routing strategy
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin (CDN fonts/icons handled by browser cache)
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) return;

  // Supabase API calls → Network only (no caching)
  if (url.hostname.includes('supabase.co')) {
    return event.respondWith(fetch(request).catch(() => new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })));
  }

  // Navigation requests → Network first, fallback to cache, then offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached =>
            cached || caches.match(OFFLINE_URL)
          )
        )
    );
    return;
  }

  // Static assets (CSS, JS, images, fonts) → Cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Stale-while-revalidate: serve from cache, update in background
        const fetchPromise = fetch(request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          }
          return response;
        }).catch(() => {});
        return cached;
      }
      // Not cached → fetch and cache
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // For image failures, return a minimal transparent response
        if (request.destination === 'image') {
          return new Response('', { headers: { 'Content-Type': 'image/gif' } });
        }
      });
    })
  );
});

// ============================================================
//  BACKGROUND SYNC (future: sync pending orders when back online)
// ============================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    // Reserved for future background order sync
    console.log('[SW] Background sync: orders');
  }
});

// ============================================================
//  PUSH NOTIFICATIONS (Firebase Cloud Messaging)
// ============================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: 'Humu Vault', body: event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'Humu Kabba Variety Vault', {
      body: data.body || 'You have a new notification',
      icon: '/assets/logo.jpg',
      badge: '/assets/logo.jpg',
      tag: 'hk-vault-push',
      requireInteraction: false,
      data: { url: data.url || '/index.html' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
