// sw.js
import { clientsClaim, cacheNames } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';

const SUPABASE_BASE_URL =
  'https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/datawar/';

self.skipWaiting();
clientsClaim();

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
registerRoute(
  ({ url }) => {
    return (
      url.origin === 'https://oqqutatvbdlpumixjiwg.supabase.co' && url.pathname.endsWith('.webm')
    );
  },
  new CacheFirst({
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
  }),
);

const strategy = new CacheFirst({ cacheName: cacheNames.runtime });
const urls = [
  `${SUPABASE_BASE_URL}data_grab.webm`,
  `${SUPABASE_BASE_URL}firewall_empathy.webm`,
  `${SUPABASE_BASE_URL}firewall_owyw.webm`,
  `${SUPABASE_BASE_URL}firewall_recall_cpu.webm`,
  `${SUPABASE_BASE_URL}firewall_recall_player.webm`,
  `${SUPABASE_BASE_URL}firewall_smacker.webm`,
  `${SUPABASE_BASE_URL}launchstack.webm`,
  `${SUPABASE_BASE_URL}move_buyout_cpu.webm`,
  `${SUPABASE_BASE_URL}move_buyout_player.webm`,
  `${SUPABASE_BASE_URL}move_takeover_cpu.webm`,
  `${SUPABASE_BASE_URL}move_takeover_player.webm`,
  `${SUPABASE_BASE_URL}move_tantrum_cpu.webm`,
  `${SUPABASE_BASE_URL}move_tantrum_player.webm`,
  `${SUPABASE_BASE_URL}move_theft_cpu.webm`,
  `${SUPABASE_BASE_URL}move_theft_player.webm`,
];

self.addEventListener('install', (event) => {
  // handleAll returns two promises, the second resolves after all items have been added to cache.
  const done = urls.map(
    (path) =>
      strategy.handleAll({
        event,
        request: new Request(path, { mode: 'cors' }),
      })[1],
  );

  event.waitUntil(Promise.all(done));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
