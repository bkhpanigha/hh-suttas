importScripts('https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js');

const filesToCache = [
  "RobotoSerif-Regular.ttf",
  "available_suttas.json",
  "available_suttas.py",
  "generateCacheList.js",
  "images/GitHub-Mark-64px-black.png",
  "images/favicon-192x192.png",
  "images/favicon-donate.png",
  "images/favicon-donorbox.png",
  "images/favicon-youtube.png",
  "images/favicon.jpg",
  "index.css",
  "index.html",
  "index.js",
  "js/fuse.js",
  "js/showdown.min.js",
  "roboto-lightest.woff",
  "suttas/html/mn/mn100_html.json",
  "suttas/html/mn/mn101_html.json",
  "suttas/html/mn/mn102_html.json",
  "suttas/html/mn/mn103_html.json",
  "suttas/html/mn/mn104_html.json",
  "suttas/html/mn/mn105_html.json",
  "suttas/html/mn/mn106_html.json",
  "suttas/html/mn/mn107_html.json",
  "suttas/html/mn/mn108_html.json",
  "suttas/html/mn/mn109_html.json",
  "suttas/html/mn/mn10_html.json",
  "suttas/html/mn/mn110_html.json",
  "suttas/html/mn/mn111_html.json",
  "suttas/html/mn/mn112_html.json",
  "suttas/html/mn/mn113_html.json",
  "suttas/html/mn/mn114_html.json",
  "suttas/html/mn/mn115_html.json",
  "suttas/html/mn/mn116_html.json",
  "suttas/html/mn/mn117_html.json",
  "suttas/html/mn/mn118_html.json",
  "suttas/html/mn/mn119_html.json",
  "suttas/html/mn/mn11_html.json",
  "suttas/html/mn/mn120_html.json",
  "suttas/html/mn/mn121_html.json",
  "suttas/html/mn/mn122_html.json",
  "suttas/html/mn/mn123_html.json",
  "suttas/html/mn/mn124_html.json",
  "suttas/html/mn/mn125_html.json",
  "suttas/html/mn/mn126_html.json",
  "suttas/html/mn/mn127_html.json",
  "suttas/html/mn/mn128_html.json",
  "suttas/html/mn/mn129_html.json",
  "suttas/html/mn/mn12_html.json",
  "suttas/html/mn/mn130_html.json",
  "suttas/html/mn/mn131_html.json",
  "suttas/html/mn/mn132_html.json",
  "suttas/html/mn/mn133_html.json",
  "suttas/html/mn/mn134_html.json",
  "suttas/html/mn/mn135_html.json",
  "suttas/html/mn/mn136_html.json",
  "suttas/html/mn/mn137_html.json",
  "suttas/html/mn/mn138_html.json",
  "suttas/html/mn/mn139_html.json",
  "suttas/html/mn/mn13_html.json",
  "suttas/html/mn/mn140_html.json",
  "suttas/html/mn/mn141_html.json",
  "suttas/html/mn/mn142_html.json",
  "suttas/html/mn/mn143_html.json",
  "suttas/html/mn/mn144_html.json",
  "suttas/html/mn/mn145_html.json",
  "suttas/html/mn/mn146_html.json",
  "suttas/html/mn/mn147_html.json",
  "suttas/html/mn/mn148_html.json",
  "suttas/html/mn/mn149_html.json",
  "suttas/html/mn/mn14_html.json",
  "suttas/html/mn/mn150_html.json",
  "suttas/html/mn/mn151_html.json",
  "suttas/html/mn/mn152_html.json",
  "suttas/html/mn/mn15_html.json",
  "suttas/html/mn/mn16_html.json",
  "suttas/html/mn/mn17_html.json",
  "suttas/html/mn/mn18_html.json",
  "suttas/html/mn/mn19_html.json",
  "suttas/html/mn/mn1_html.json",
  "suttas/html/mn/mn20_html.json",
  "suttas/html/mn/mn21_html.json",
  "suttas/html/mn/mn22_html.json",
  "suttas/html/mn/mn23_html.json",
  "suttas/html/mn/mn24_html.json",
  "suttas/html/mn/mn25_html.json",
  "suttas/html/mn/mn26_html.json",
  "suttas/html/mn/mn27_html.json",
  "suttas/html/mn/mn28_html.json",
  "suttas/html/mn/mn29_html.json",
  "suttas/html/mn/mn2_html.json",
  "suttas/html/mn/mn30_html.json",
  "suttas/html/mn/mn31_html.json",
  "suttas/html/mn/mn32_html.json",
  "suttas/html/mn/mn33_html.json",
  "suttas/html/mn/mn34_html.json",
  "suttas/html/mn/mn35_html.json",
  "suttas/html/mn/mn36_html.json",
  "suttas/html/mn/mn37_html.json",
  "suttas/html/mn/mn38_html.json",
  "suttas/html/mn/mn39_html.json",
  "suttas/html/mn/mn3_html.json",
  "suttas/html/mn/mn40_html.json",
  "suttas/html/mn/mn41_html.json",
  "suttas/html/mn/mn42_html.json",
  "suttas/html/mn/mn43_html.json",
  "suttas/html/mn/mn44_html.json",
  "suttas/html/mn/mn45_html.json",
  "suttas/html/mn/mn46_html.json",
  "suttas/html/mn/mn47_html.json",
  "suttas/html/mn/mn48_html.json",
  "suttas/html/mn/mn49_html.json",
  "suttas/html/mn/mn4_html.json",
  "suttas/html/mn/mn50_html.json",
  "suttas/html/mn/mn51_html.json",
  "suttas/html/mn/mn52_html.json",
  "suttas/html/mn/mn53_html.json",
  "suttas/html/mn/mn54_html.json",
  "suttas/html/mn/mn55_html.json",
  "suttas/html/mn/mn56_html.json",
  "suttas/html/mn/mn57_html.json",
  "suttas/html/mn/mn58_html.json",
  "suttas/html/mn/mn59_html.json",
  "suttas/html/mn/mn5_html.json",
  "suttas/html/mn/mn60_html.json",
  "suttas/html/mn/mn61_html.json",
  "suttas/html/mn/mn62_html.json",
  "suttas/html/mn/mn63_html.json",
  "suttas/html/mn/mn64_html.json",
  "suttas/html/mn/mn65_html.json",
  "suttas/html/mn/mn66_html.json",
  "suttas/html/mn/mn67_html.json",
  "suttas/html/mn/mn68_html.json",
  "suttas/html/mn/mn69_html.json",
  "suttas/html/mn/mn6_html.json",
  "suttas/html/mn/mn70_html.json",
  "suttas/html/mn/mn71_html.json",
  "suttas/html/mn/mn72_html.json",
  "suttas/html/mn/mn73_html.json",
  "suttas/html/mn/mn74_html.json",
  "suttas/html/mn/mn75_html.json",
  "suttas/html/mn/mn76_html.json",
  "suttas/html/mn/mn77_html.json",
  "suttas/html/mn/mn78_html.json",
  "suttas/html/mn/mn79_html.json",
  "suttas/html/mn/mn7_html.json",
  "suttas/html/mn/mn80_html.json",
  "suttas/html/mn/mn81_html.json",
  "suttas/html/mn/mn82_html.json",
  "suttas/html/mn/mn83_html.json",
  "suttas/html/mn/mn84_html.json",
  "suttas/html/mn/mn85_html.json",
  "suttas/html/mn/mn86_html.json",
  "suttas/html/mn/mn87_html.json",
  "suttas/html/mn/mn88_html.json",
  "suttas/html/mn/mn89_html.json",
  "suttas/html/mn/mn8_html.json",
  "suttas/html/mn/mn90_html.json",
  "suttas/html/mn/mn91_html.json",
  "suttas/html/mn/mn92_html.json",
  "suttas/html/mn/mn93_html.json",
  "suttas/html/mn/mn94_html.json",
  "suttas/html/mn/mn95_html.json",
  "suttas/html/mn/mn96_html.json",
  "suttas/html/mn/mn97_html.json",
  "suttas/html/mn/mn98_html.json",
  "suttas/html/mn/mn99_html.json",
  "suttas/html/mn/mn9_html.json",
  "suttas/root/mn/mn100_root-pli-ms.json",
  "suttas/root/mn/mn101_root-pli-ms.json",
  "suttas/root/mn/mn102_root-pli-ms.json",
  "suttas/root/mn/mn103_root-pli-ms.json",
  "suttas/root/mn/mn104_root-pli-ms.json",
  "suttas/root/mn/mn105_root-pli-ms.json",
  "suttas/root/mn/mn106_root-pli-ms.json",
  "suttas/root/mn/mn107_root-pli-ms.json",
  "suttas/root/mn/mn108_root-pli-ms.json",
  "suttas/root/mn/mn109_root-pli-ms.json",
  "suttas/root/mn/mn10_root-pli-ms.json",
  "suttas/root/mn/mn110_root-pli-ms.json",
  "suttas/root/mn/mn111_root-pli-ms.json",
  "suttas/root/mn/mn112_root-pli-ms.json",
  "suttas/root/mn/mn113_root-pli-ms.json",
  "suttas/root/mn/mn114_root-pli-ms.json",
  "suttas/root/mn/mn115_root-pli-ms.json",
  "suttas/root/mn/mn116_root-pli-ms.json",
  "suttas/root/mn/mn117_root-pli-ms.json",
  "suttas/root/mn/mn118_root-pli-ms.json",
  "suttas/root/mn/mn119_root-pli-ms.json",
  "suttas/root/mn/mn11_root-pli-ms.json",
  "suttas/root/mn/mn120_root-pli-ms.json",
  "suttas/root/mn/mn121_root-pli-ms.json",
  "suttas/root/mn/mn122_root-pli-ms.json",
  "suttas/root/mn/mn123_root-pli-ms.json",
  "suttas/root/mn/mn124_root-pli-ms.json",
  "suttas/root/mn/mn125_root-pli-ms.json",
  "suttas/root/mn/mn126_root-pli-ms.json",
  "suttas/root/mn/mn127_root-pli-ms.json",
  "suttas/root/mn/mn128_root-pli-ms.json",
  "suttas/root/mn/mn129_root-pli-ms.json",
  "suttas/root/mn/mn12_root-pli-ms.json",
  "suttas/root/mn/mn130_root-pli-ms.json",
  "suttas/root/mn/mn131_root-pli-ms.json",
  "suttas/root/mn/mn132_root-pli-ms.json",
  "suttas/root/mn/mn133_root-pli-ms.json",
  "suttas/root/mn/mn134_root-pli-ms.json",
  "suttas/root/mn/mn135_root-pli-ms.json",
  "suttas/root/mn/mn136_root-pli-ms.json",
  "suttas/root/mn/mn137_root-pli-ms.json",
  "suttas/root/mn/mn138_root-pli-ms.json",
  "suttas/root/mn/mn139_root-pli-ms.json",
  "suttas/root/mn/mn13_root-pli-ms.json",
  "suttas/root/mn/mn140_root-pli-ms.json",
  "suttas/root/mn/mn141_root-pli-ms.json",
  "suttas/root/mn/mn142_root-pli-ms.json",
  "suttas/root/mn/mn143_root-pli-ms.json",
  "suttas/root/mn/mn144_root-pli-ms.json",
  "suttas/root/mn/mn145_root-pli-ms.json",
  "suttas/root/mn/mn146_root-pli-ms.json",
  "suttas/root/mn/mn147_root-pli-ms.json",
  "suttas/root/mn/mn148_root-pli-ms.json",
  "suttas/root/mn/mn149_root-pli-ms.json",
  "suttas/root/mn/mn14_root-pli-ms.json",
  "suttas/root/mn/mn150_root-pli-ms.json",
  "suttas/root/mn/mn151_root-pli-ms.json",
  "suttas/root/mn/mn152_root-pli-ms.json",
  "suttas/root/mn/mn15_root-pli-ms.json",
  "suttas/root/mn/mn16_root-pli-ms.json",
  "suttas/root/mn/mn17_root-pli-ms.json",
  "suttas/root/mn/mn18_root-pli-ms.json",
  "suttas/root/mn/mn19_root-pli-ms.json",
  "suttas/root/mn/mn1_root-pli-ms.json",
  "suttas/root/mn/mn20_root-pli-ms.json",
  "suttas/root/mn/mn21_root-pli-ms.json",
  "suttas/root/mn/mn22_root-pli-ms.json",
  "suttas/root/mn/mn23_root-pli-ms.json",
  "suttas/root/mn/mn24_root-pli-ms.json",
  "suttas/root/mn/mn25_root-pli-ms.json",
  "suttas/root/mn/mn26_root-pli-ms.json",
  "suttas/root/mn/mn27_root-pli-ms.json",
  "suttas/root/mn/mn28_root-pli-ms.json",
  "suttas/root/mn/mn29_root-pli-ms.json",
  "suttas/root/mn/mn2_root-pli-ms.json",
  "suttas/root/mn/mn30_root-pli-ms.json",
  "suttas/root/mn/mn31_root-pli-ms.json",
  "suttas/root/mn/mn32_root-pli-ms.json",
  "suttas/root/mn/mn33_root-pli-ms.json",
  "suttas/root/mn/mn34_root-pli-ms.json",
  "suttas/root/mn/mn35_root-pli-ms.json",
  "suttas/root/mn/mn36_root-pli-ms.json",
  "suttas/root/mn/mn37_root-pli-ms.json",
  "suttas/root/mn/mn38_root-pli-ms.json",
  "suttas/root/mn/mn39_root-pli-ms.json",
  "suttas/root/mn/mn3_root-pli-ms.json",
  "suttas/root/mn/mn40_root-pli-ms.json",
  "suttas/root/mn/mn41_root-pli-ms.json",
  "suttas/root/mn/mn42_root-pli-ms.json",
  "suttas/root/mn/mn43_root-pli-ms.json",
  "suttas/root/mn/mn44_root-pli-ms.json",
  "suttas/root/mn/mn45_root-pli-ms.json",
  "suttas/root/mn/mn46_root-pli-ms.json",
  "suttas/root/mn/mn47_root-pli-ms.json",
  "suttas/root/mn/mn48_root-pli-ms.json",
  "suttas/root/mn/mn49_root-pli-ms.json",
  "suttas/root/mn/mn4_root-pli-ms.json",
  "suttas/root/mn/mn50_root-pli-ms.json",
  "suttas/root/mn/mn51_root-pli-ms.json",
  "suttas/root/mn/mn52_root-pli-ms.json",
  "suttas/root/mn/mn53_root-pli-ms.json",
  "suttas/root/mn/mn54_root-pli-ms.json",
  "suttas/root/mn/mn55_root-pli-ms.json",
  "suttas/root/mn/mn56_root-pli-ms.json",
  "suttas/root/mn/mn57_root-pli-ms.json",
  "suttas/root/mn/mn58_root-pli-ms.json",
  "suttas/root/mn/mn59_root-pli-ms.json",
  "suttas/root/mn/mn5_root-pli-ms.json",
  "suttas/root/mn/mn60_root-pli-ms.json",
  "suttas/root/mn/mn61_root-pli-ms.json",
  "suttas/root/mn/mn62_root-pli-ms.json",
  "suttas/root/mn/mn63_root-pli-ms.json",
  "suttas/root/mn/mn64_root-pli-ms.json",
  "suttas/root/mn/mn65_root-pli-ms.json",
  "suttas/root/mn/mn66_root-pli-ms.json",
  "suttas/root/mn/mn67_root-pli-ms.json",
  "suttas/root/mn/mn68_root-pli-ms.json",
  "suttas/root/mn/mn69_root-pli-ms.json",
  "suttas/root/mn/mn6_root-pli-ms.json",
  "suttas/root/mn/mn70_root-pli-ms.json",
  "suttas/root/mn/mn71_root-pli-ms.json",
  "suttas/root/mn/mn72_root-pli-ms.json",
  "suttas/root/mn/mn73_root-pli-ms.json",
  "suttas/root/mn/mn74_root-pli-ms.json",
  "suttas/root/mn/mn75_root-pli-ms.json",
  "suttas/root/mn/mn76_root-pli-ms.json",
  "suttas/root/mn/mn77_root-pli-ms.json",
  "suttas/root/mn/mn78_root-pli-ms.json",
  "suttas/root/mn/mn79_root-pli-ms.json",
  "suttas/root/mn/mn7_root-pli-ms.json",
  "suttas/root/mn/mn80_root-pli-ms.json",
  "suttas/root/mn/mn81_root-pli-ms.json",
  "suttas/root/mn/mn82_root-pli-ms.json",
  "suttas/root/mn/mn83_root-pli-ms.json",
  "suttas/root/mn/mn84_root-pli-ms.json",
  "suttas/root/mn/mn85_root-pli-ms.json",
  "suttas/root/mn/mn86_root-pli-ms.json",
  "suttas/root/mn/mn87_root-pli-ms.json",
  "suttas/root/mn/mn88_root-pli-ms.json",
  "suttas/root/mn/mn89_root-pli-ms.json",
  "suttas/root/mn/mn8_root-pli-ms.json",
  "suttas/root/mn/mn90_root-pli-ms.json",
  "suttas/root/mn/mn91_root-pli-ms.json",
  "suttas/root/mn/mn92_root-pli-ms.json",
  "suttas/root/mn/mn93_root-pli-ms.json",
  "suttas/root/mn/mn94_root-pli-ms.json",
  "suttas/root/mn/mn95_root-pli-ms.json",
  "suttas/root/mn/mn96_root-pli-ms.json",
  "suttas/root/mn/mn97_root-pli-ms.json",
  "suttas/root/mn/mn98_root-pli-ms.json",
  "suttas/root/mn/mn99_root-pli-ms.json",
  "suttas/root/mn/mn9_root-pli-ms.json",
  "suttas/translation_en/mn1.json",
  "suttas/translation_en/mn10.json",
  "suttas/translation_en/mn11.json",
  "suttas/translation_en/mn12.json",
  "suttas/translation_en/mn13.json",
  "suttas/translation_en/mn14.json",
  "suttas/translation_en/mn15.json",
  "suttas/translation_en/mn16.json",
  "suttas/translation_en/mn17.json",
  "suttas/translation_en/mn18.json",
  "suttas/translation_en/mn19.json",
  "suttas/translation_en/mn2.json",
  "suttas/translation_en/mn20.json",
  "suttas/translation_en/mn21.json",
  "suttas/translation_en/mn22.json",
  "suttas/translation_en/mn23.json",
  "suttas/translation_en/mn24.json",
  "suttas/translation_en/mn25.json",
  "suttas/translation_en/mn27.json",
  "suttas/translation_en/mn28.json",
  "suttas/translation_en/mn3.json",
  "suttas/translation_en/mn4.json",
  "suttas/translation_en/mn5.json",
  "suttas/translation_en/mn6.json",
  "suttas/translation_en/mn7.json",
  "suttas/translation_en/mn8.json",
  "suttas/translation_en/mn9.json",
  "utils.js"
];


const cacheName = 'hh-suttas-cache-v1';

self.addEventListener('install', event => {
  
  // event.waitUntil(
  //   caches.open(cacheName)
  //     .then(cache => cache.addAll(filesToCache))
  //     .then(() => self.skipWaiting()) // Activate the new service worker immediately
  // );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
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

