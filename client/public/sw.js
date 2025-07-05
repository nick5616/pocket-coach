// Service Worker Cleanup - This will unregister itself and clear caches
console.log('PocketCoach: Service Worker cleanup starting');

// Clear all caches on install
self.addEventListener('install', function(event) {
  console.log('PocketCoach: Clearing all caches');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('PocketCoach: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Force activation
  self.skipWaiting();
});

// Activate and unregister
self.addEventListener('activate', function(event) {
  console.log('PocketCoach: Service Worker activating and self-destructing');
  event.waitUntil(
    self.registration.unregister().then(function() {
      console.log('PocketCoach: Service Worker unregistered successfully');
      return self.clients.matchAll();
    }).then(function(clients) {
      clients.forEach(client => {
        console.log('PocketCoach: Reloading client');
        client.navigate(client.url);
      });
    })
  );
});

// Don't intercept any fetches - let everything go to network
self.addEventListener('fetch', function(event) {
  // Do nothing - let all requests go to network
  return;
});