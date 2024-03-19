// static files to cache
const filesToCache = [
  "roboto-lightest.woff",
  "RobotoSerif-Regular.ttf",
  "available_suttas.json",
  "index.css",
  "index.html",
  "index.js",
];



const cacheName = 'hh-suttas-cache-v2';

self.addEventListener('install', event => {

  // event.waitUntil(
  //   caches.open(cacheName)
  //     .then(cache => cache.addAll(filesToCache))
  //     .then(() => self.skipWaiting()) // Activate the new service worker immediately
  // );
});

self.addEventListener('message', event => {
  // Check if the message is to trigger caching
  if (event.data && event.data.action === 'cacheResources') {
    // Perform caching operations here
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
      .then(() => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ action: 'cachingSuccess' });
          });
        });
      })
      .catch(error => {
        client.postMessage({ action: 'cachingError' });
        console.error(error)
      });
  }
});

self.addEventListener('fetch', function(event) {
  if(!event.request.url.startsWith('http')){
    return
 }
  event.respondWith(
    // Fetch from network first
    fetch(event.request)
      .then(function(response) {
        // If successful response, clone it, cache it, and return
        
        if (response && response.status === 200) {
          var responseToCache = response.clone();
          caches.open(cacheName).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(function() {
        // If fetch fails, try to get the response from cache
        console.log("index.html:")
        return caches.match(event.request)
          .then(function(response) {
            // If found in cache, return response
            if (response) {
            
              return response;
            }
            // If not found in cache, respond with a basic offline page
            
            return caches.match('/index.html');
          });
        
      })
  );
});

