self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Pass-through mainly, no offline caching for now significantly
    // This satisfies the PWA requirement "Has a registered service worker"
    return;
});
