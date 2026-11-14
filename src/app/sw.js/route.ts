// Serves the service worker with this build's id stamped in, so every deploy
// gets a new page cache instead of one cache name fixed for ever. Rendered once
// at build time.
export const dynamic = "force-static";

const BUILD_ID = (process.env.VERCEL_GIT_COMMIT_SHA ?? Date.now().toString(36)).slice(0, 12);

const script = String.raw`// IT Passport study app service worker, build ${BUILD_ID}.
// - Page HTML: network first, cached per build for offline use.
// - Hashed build files (/_next/static) and icons: cache first. They never
//   change under one name, so they live in a cache that survives deploys
//   (an open tab from the last build can still load its chunks) and is trimmed.
// - React Server Component payloads, API calls, other origins: never cached.
const BUILD = "${BUILD_ID}";
const PAGES = "it-passport-pages-" + BUILD;
const STATIC = "it-passport-static";
const STATIC_MAX_ENTRIES = 250;
const CORE = ["/", "/manifest.webmanifest", "/icon.svg", "/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES).then((cache) => cache.addAll(CORE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== PAGES && k !== STATIC)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  // Cache keys come back in insertion order: drop the oldest first.
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /^\/(icon[\w-]*\.(svg|png)|apple-touch-icon\.png)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname === "/sw.js") return;
  if (request.headers.has("authorization") || request.headers.has("range")) return;
  // Client-side navigations fetch RSC payloads. Never serve those from cache:
  // a payload from an older build points at chunks that no longer exist.
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(PAGES).then((c) => c.put(request, copy)).catch(() => {}));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(PAGES);
          return (
            (await cache.match(request)) ||
            (await cache.match(request, { ignoreSearch: true })) ||
            (await cache.match("/")) ||
            Response.error()
          );
        })
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          event.waitUntil(cache.put(request, copy).then(() => trim(STATIC, STATIC_MAX_ENTRIES)).catch(() => {}));
        }
        return response;
      })
    );
  }
  // Everything else (manifest, fonts, data) goes to the network as normal.
});
`;

export function GET() {
  return new Response(script, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
