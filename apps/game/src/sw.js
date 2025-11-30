// sw.js
import { cacheNames, clientsClaim, setCacheNameDetails } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { precacheAndRoute } from 'workbox-precaching';

const CACHE_VERSION = 'v1';
const CACHE_NAME = `datawar-game-media`;
const SUPABASE_BASE_URL =
  'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/';

self.skipWaiting();
clientsClaim();

setCacheNameDetails({
  prefix: CACHE_NAME,
  precache: 'precache',
  runtime: 'runtime',
  suffix: CACHE_VERSION,
});

precacheAndRoute(self.__WB_MANIFEST || []);

const cacheStrategy = new CacheFirst({
  cacheName: cacheNames.runtime,
  matchOptions: {
    ignoreSearch: true,
    ignoreVary: true,
    ignoreMethod: true,
  },
  plugins: [
    new CacheableResponsePlugin({
      statuses: [200],
    }),
    new RangeRequestsPlugin(),
  ],
});

// In your service worker:
// It's up to you to either precache, use warmRuntimeCache, or
// explicitly call cache.add() to populate the cache with media assets.
// If you choose to cache media assets up front, do so with care,
// as they can be quite large and exceed storage quotas.
//
// This route will go to the network if there isn't a cache match,
// but it won't populate the cache at runtime because the response for
// the media asset will be a partial 206 response. If there is a cache
// match, then it will properly serve partial responses.
registerRoute(({ url }) => {
  console.log('************************');
  console.log('Route hit: ', url, 'matches', url.href.startsWith(SUPABASE_BASE_URL));
  console.log('************************');

  return url.href.startsWith(SUPABASE_BASE_URL);
}, cacheStrategy);

self.addEventListener('install', (event) => {
  console.log('************************');
  console.log('In sw install', 'cacheNames', cacheNames.precache, cacheNames.runtime);
  console.log('************************');

  // handleAll returns two promises, the second resolves after all items have been added to cache.
  // const done = urls.map(
  //   (path) =>
  //     cacheStrategy.handleAll({
  //       event,
  //       request: new Request(path, { mode: 'cors' }),
  //     })[1],
  // );
  // event.waitUntil(Promise.all(done));
});

self.addEventListener('activate', (event) => {
  console.log('************************');
  console.log('In sw activate', 'cacheNames', cacheNames.precache, cacheNames.runtime);
  console.log('************************');
  event.waitUntil(self.clients.claim());
});
