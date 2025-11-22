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

const preCacheUrls = [
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
  `${SUPABASE_BASE_URL}audio-bonk.webm`,
  `${SUPABASE_BASE_URL}audio-button-d.webm`,
  `${SUPABASE_BASE_URL}audio-card-collect.webm`,
  `${SUPABASE_BASE_URL}audio-card-flip.webm`,
  `${SUPABASE_BASE_URL}audio-data-war.webm`,
  `${SUPABASE_BASE_URL}audio-drawer_start-turn.webm`,
  `${SUPABASE_BASE_URL}audio-end-sequence.webm`,
  `${SUPABASE_BASE_URL}audio-event-takeover.webm`,
  `${SUPABASE_BASE_URL}audio-gameplay-loop.webm`,
  `${SUPABASE_BASE_URL}audio-go.webm`,
  `${SUPABASE_BASE_URL}audio-hand-viewer_deck-swap.webm`,
  `${SUPABASE_BASE_URL}audio-launch-stack-card-collect.webm`,
  `${SUPABASE_BASE_URL}audio-launch-stack-cha-ching.webm`,
  `${SUPABASE_BASE_URL}audio-launch-stack-rocket.webm`,
  `${SUPABASE_BASE_URL}audio-opponent-win.webm`,
  `${SUPABASE_BASE_URL}audio-player-win.webm`,
  `${SUPABASE_BASE_URL}audio-quick-launch.webm`,
  `${SUPABASE_BASE_URL}audio-rocket-flyby.webm`,
  `${SUPABASE_BASE_URL}audio-select-bg-alt.webm`,
  `${SUPABASE_BASE_URL}audio-select-bg.webm`,
  `${SUPABASE_BASE_URL}audio-title-music.webm`,
  `${SUPABASE_BASE_URL}audio-turn-value.webm`,
  `${SUPABASE_BASE_URL}audio-vs-animation.webm`,
  `${SUPABASE_BASE_URL}audio-war-3-card.webm`,
];

precacheAndRoute(preCacheUrls);

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
  console.log('Route hit: ', url);
  console.log('************************');

  return url.href.startsWith(SUPABASE_BASE_URL) && url.pathname.endsWith('.webm');
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

  console.log('************************');
  console.log('In sw activate: awaiting promise for', urls);
  console.log('************************');
  event.waitUntil(Promise.all(done));
});

self.addEventListener('activate', (event) => {
  console.log('************************');
  console.log('In sw activate', 'cacheNames', cacheNames.precache, cacheNames.runtime);
  console.log('************************');
  event.waitUntil(self.clients.claim());
});
