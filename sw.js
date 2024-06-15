const version = 'v4'; // Update this version manually when filesToCache changes

// static files to cache
const filesToCache = [
  "roboto-lightest.woff",
  "RobotoSerif-Regular.ttf",
  "available_suttas.json",
  "index.css",
  "index.html",
  "index.js",
];
// Load additional files from files_to_cache.json and add them to filesToCache
fetch('files_to_cache.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(file => {
      filesToCache.push(file);
    });
  })
  .catch(error => console.error('Error loading files_to_cache.json:', error));

const cacheName = `hh-suttas-cache-${version}`;

self.addEventListener('install', event => {
  self.skipWaiting()
});

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'cacheResources') {
    caches.open(cacheName)
      .then(cache => {
        const batchSize = 200;
        const addFilesInBatches = async (files) => {
          for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);
            const addPromises = batch.map(file => {
              return cache.add(file).catch(() => {
                console.error('Caching failed for resource:', file);
              });
            });
            await Promise.all(addPromises);
          }
        };
        return addFilesInBatches(filesToCache);
      })
      .then(() => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ action: 'cachingSuccess' });
          });
        });
      })
      .catch(error => {
        console.error('Unexpected error:', error);
      });
  }
});

self.addEventListener('fetch', function (event) {
  if (!event.request.url.startsWith('http')) {
    return;
  }
  event.respondWith(
    // Fetch from network first
    fetch(event.request)
      .then(function (response) {
        // If successful response, clone it, cache it, and return
        if (response && response.status === 200) {
          var responseToCache = response.clone();
          caches.open(cacheName).then(function (cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(function () {
        // If fetch fails, try to get the response from cache
        console.log("index.html:");
        return caches.match(event.request)
          .then(function (response) {
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
