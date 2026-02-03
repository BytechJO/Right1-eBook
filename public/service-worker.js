const CACHE_NAME = "classbook-v8";
const OFFLINE_FALLBACK = "/index.html";

// 🔹 INSTALL: خزّن الصفحة الرئيسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([OFFLINE_FALLBACK])
    )
  );
  self.skipWaiting();
});

// 🔹 ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 🔹 FETCH
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 🟢 React SPA navigation + Refresh
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(OFFLINE_FALLBACK).then((cached) => {
        return cached || fetch(OFFLINE_FALLBACK);
      })
    );
    return;
  }

  // 🟢 ملفات من نفس الموقع
  if (request.method === "GET" && url.origin === self.location.origin) {
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);

        // ⛔ لا نخزّن 206
        if (response.status === 200) {
          cache.put(request, response.clone());
        }

        return response;
      } catch (err) {
        return cache.match(request);
      }
    })
  );
}

});


// 📩 استقبل رسالة من الموقع
self.addEventListener("message", async (event) => {
  if (event.data?.type !== "PRELOAD_ALL") return;

  const assets = event.data.assets;

  // حماية إضافية
  if (!Array.isArray(assets)) {
    console.error("PRELOAD_ALL assets is not an array:", assets);
    return;
  }

  const cache = await caches.open(CACHE_NAME);

  let loaded = 0;
  const total = assets.length;

  for (const url of assets) {
    try {
      const response = await fetch(url);

      // ⛔ لا نخزّن Partial
      if (response.status === 200) {
        await cache.put(url, response.clone());
      }

      loaded++;

      // progress
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: "PRELOAD_PROGRESS",
          loaded,
          total,
        });
      });
    } catch (e) {
      console.error("Failed to cache:", url);
    }
  }

  // خلصنا
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: "PRELOAD_DONE" });
  });
});

