import { filesToCache } from './filesToCache.js';

const cacheName = 'hh-suttas-cache-v1';

self.addEventListener("install", async (event) => {
    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(filesToCache);
    } catch (error) {
      console.error("Service Worker installation failed:", error);
    }
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
      (async () => {
        const cache = await caches.open(cacheName);
  
        try {
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            console.log("cachedResponse: ", event.request.url);
            return cachedResponse;
          }
  
          const fetchResponse = await fetch(event.request);
          if (fetchResponse) {
            console.log("fetchResponse: ", event.request.url);
            await cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          }
        } catch (error) {
          console.log("Fetch failed: ", error);
          const cachedResponse = await cache.match("index.html");
          return cachedResponse;
        }
      })()
    );
  });