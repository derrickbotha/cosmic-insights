// Service Worker for Cosmic Insights PWA
const CACHE_NAME = 'cosmic-insights-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache opened');
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('[SW] Cache addAll error:', error);
        });
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - minimal interception, let browser handle most requests
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Only intercept same-origin requests for the cached resources
  if (!url.startsWith(self.location.origin)) {
    return;
  }
  
  // Never intercept API calls, WebSocket, extensions, or email verification
  if (url.includes('/api/') || 
      url.includes('/ws') || 
      url.includes('chrome-extension') ||
      url.includes('/verify-email') ||
      url.includes('token=')) {
    return;
  }
  
  // Only handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
