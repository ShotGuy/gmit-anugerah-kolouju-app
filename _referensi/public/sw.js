const CACHE_NAME = 'gmit-jbob-v1.0';
const STATIC_CACHE = 'gmit-jbob-static-v1.0';
const DYNAMIC_CACHE = 'gmit-jbob-dynamic-v1.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/logo-GMIT.png',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/site.webmanifest',
];

// Install service worker and cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Sophisticated fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests and chrome extensions
  if (request.url.startsWith('chrome-extension://') ||
    request.url.includes('extension') ||
    url.origin !== self.location.origin) {
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    event.respondWith(handleGetRequest(request));
  }
});

async function handleGetRequest(request) {
  const url = new URL(request.url);

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    return networkFirst(request, DYNAMIC_CACHE);
  }

  // Static assets - cache first
  if (request.destination === 'image' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.includes('/static/') ||
    url.pathname.includes('.')) {
    return cacheFirst(request, STATIC_CACHE);
  }

  // HTML pages - network first with cache fallback
  return networkFirst(request, DYNAMIC_CACHE);
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('SW: Cache first failed', error);
    return caches.match('/offline.html') || new Response('Offline');
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('SW: Network first failed, trying cache', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match('/') || new Response('Offline');
  }
}

// Update cache when new version is available
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');

  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('SW: Deleting cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW: Skipping waiting...');
    self.skipWaiting();
  }
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Add background sync logic here if needed
      console.log('SW: Background sync triggered')
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});