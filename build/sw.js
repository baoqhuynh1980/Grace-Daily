// Self-destruct service worker
// Fixes the white-screen-on-first-load bug caused by aggressive caching
// This SW unregisters itself, clears caches, and reloads any open clients

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach(client => client.navigate(client.url));
      } catch (err) {
        console.error('SW cleanup error:', err);
      }
    })()
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
