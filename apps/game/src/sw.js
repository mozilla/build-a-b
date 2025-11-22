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
  { url: `${SUPABASE_BASE_URL}data_grab.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}firewall_empathy.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}firewall_owyw.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}firewall_recall_cpu.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}firewall_recall_player.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}firewall_smacker.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}launchstack.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}move_buyout_cpu.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}move_buyout_player.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}move_takeover_cpu.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}move_takeover_player.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}move_tantrum_cpu.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}move_tantrum_player.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}move_theft_cpu.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}move_theft_player.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-bonk.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-button-d.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-card-collect.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-card-flip.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-data-war.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-drawer_start-turn.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-end-sequence.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-event-takeover.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-gameplay-loop.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-go.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-hand-viewer_deck-swap.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-launch-stack-card-collect.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-launch-stack-cha-ching.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-launch-stack-rocket.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-opponent-win.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-player-win.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-quick-launch.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-rocket-flyby.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-select-bg-alt.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-select-bg.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-title-music.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-turn-value.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-vs-animation.webm`, revision: null },
  { url: `${SUPABASE_BASE_URL}audio-war-3-card.webm`, revision: null },
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
  // event.waitUntil(Promise.all(done));
});

self.addEventListener('activate', (event) => {
  console.log('************************');
  console.log('In sw activate', 'cacheNames', cacheNames.precache, cacheNames.runtime);
  console.log('************************');
  event.waitUntil(self.clients.claim());
});
