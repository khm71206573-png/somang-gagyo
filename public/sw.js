const CACHE_VERSION = "v1";
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const KNOWN_CACHES = [APP_SHELL_CACHE, RUNTIME_CACHE];

// "/"·"/devotion"·"/bible-progress"는 로그인이 필요한 페이지라 설치 시점에
// 미리 받아두면 로그인 전 리다이렉트(/login) 응답이 캐시될 위험이 있다.
// 대신 아래 fetch 핸들러가 실제 방문 성공 시점에 network-first로 채워 넣는다.
const APP_SHELL_URLS = ["/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .catch(() => {
        // 최초 설치 시 네트워크가 없어도 설치 자체는 계속 진행
      }),
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
            .filter((key) => !KNOWN_CACHES.includes(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // 페이지 이동(HTML 문서): network-first, 실패 시 캐시 → 오프라인 페이지
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || (await caches.match("/offline"));
        }),
    );
    return;
  }

  // Next 정적 자산(_next/static): 해시가 포함되어 불변이므로 cache-first
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            return response;
          }),
      ),
    );
    return;
  }

  // Supabase REST 조회(GET): network-first, 실패 시 캐시된 마지막 응답 사용
  // (오늘의 묵상 · 통독 분량 등은 TanStack Query 캐시가 주로 담당하고, 이는 보조 캐시)
  if (url.pathname.startsWith("/rest/v1/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)),
    );
  }
});

self.addEventListener("push", (event) => {
  let data = { title: "소망가교", body: "새 알림이 있어요." };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      // JSON이 아니면 기본 문구를 사용
    }
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsList) => {
        for (const client of clientsList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
