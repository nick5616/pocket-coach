const CACHE_NAME = 'pocket-coach-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  // Add other static assets you want to cache
];

// Install event
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline workout submissions
self.addEventListener('sync', function(event) {
  if (event.tag === 'workout-sync') {
    event.waitUntil(syncWorkouts());
  }
});

// Push notifications
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'New workout reminder!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'start-workout',
        title: 'Start Workout',
        icon: '/icons/start-workout.png'
      },
      {
        action: 'dismiss',
        title: 'Later',
        icon: '/icons/dismiss.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Pocket Coach', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'start-workout') {
    event.waitUntil(
      clients.openWindow('/workout-journal')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync workouts when back online
async function syncWorkouts() {
  try {
    // Get pending workouts from IndexedDB or localStorage
    const pendingWorkouts = await getPendingWorkouts();
    
    for (const workout of pendingWorkouts) {
      try {
        await fetch('/api/workouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workout),
        });
        
        // Remove from pending list
        await removePendingWorkout(workout.id);
      } catch (error) {
        console.error('Failed to sync workout:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Helper functions for offline storage
async function getPendingWorkouts() {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

async function removePendingWorkout(id) {
  // Remove from IndexedDB
  console.log('Removing pending workout:', id);
}
