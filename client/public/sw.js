const CACHE_NAME = 'pocket-coach-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/src/index.css'
];

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('PocketCoach: Service Worker installed');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('PocketCoach: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first strategy for development
self.addEventListener('fetch', function(event) {
  // Always try network first in development
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // If network request succeeds, cache it
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(function() {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});