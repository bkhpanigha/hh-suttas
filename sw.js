const version = 'v8';

// static files to cache
const filesToCache = [
  "roboto-lightest.woff",
  "RobotoSerif-Regular.ttf",
  "../../python/generated/available_suttas.json",
  "../../python/generated/available_videos.json",
  "../../python/generated/available_playlists.json",
  "index.css",
  "index.html",
  "index.js",
];

// Load additional files from files_to_cache.json and add them to filesToCache
fetch('../../python/generated/files_to_cache.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(file => {
      filesToCache.push(file);
    });
  })
  .catch(error => console.error('Error loading files_to_cache.json:', error));

const cacheName = `hh-suttas-cache-${version}`;
const BATCH_SIZE = 50;
const MAX_RETRIES = 3; // Define max fetching retries for failed fetched batch
const TIMEOUT = 5000; // Define max time waiting for fetch response before retry

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'cacheResources') {
    cacheFilesInBatches(filesToCache);
  }
});

async function cacheFilesInBatches(files) {
  // Check if the user is online
  if (!navigator.onLine) {
    // If the user is offline, notify and exit
    notifyClients('cachingError');
    return;
  }

  // If the user is online, continue with caching
  // Delete the old cache if it exists
  const cacheNames = await caches.keys();
  for (const oldCacheName of cacheNames) {
    if (oldCacheName !== cacheName) {
      await caches.delete(oldCacheName); // Delete obsolete caches
    }
  }

  // Open or create the cache with the new name
  const cache = await caches.open(cacheName);
  
  // Add the files in batches to the cache
  const totalFiles = files.length;
  for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    let retries = 0;
    let success = false;

    while (retries < MAX_RETRIES && !success) {
      try {
        await cacheBatchWithTimeout(cache, batch); // Add the batch to the cache
        success = true;
        // Notify progress after successful batch cache
        const progress = Math.min(100, Math.round(((i + batch.length) / totalFiles) * 100));
        notifyClients('cachingProgress', { progress });
      } catch (error) {
        retries++;
        if (retries === MAX_RETRIES) {
          notifyClients('cachingError');
          caches.delete(cacheName);
          return;
        }
      }
    }
  }

  notifyClients('cachingSuccess');
}

async function cacheBatchWithTimeout(cache, batch) {
  return new Promise((resolve, reject) => {
    let timeoutId = setTimeout(() => reject(new Error('Timeout')), TIMEOUT);

    Promise.all(batch.map(async file => {
      // Caches file
      return cache.add(file).catch(() => {
        console.error('Caching failed for resource:', file);
        throw new Error('Fetch failed');
      });
    }))
      .then(() => {
        clearTimeout(timeoutId);
        resolve();
      })
      .catch(reject);
  });
}

function notifyClients(action, data = {}) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      // Include the action and any additional data in the message
      client.postMessage({ action, ...data });
    });
  });
}

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
