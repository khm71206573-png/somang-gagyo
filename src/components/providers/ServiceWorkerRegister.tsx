"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // 개발 모드에서는 등록하지 않는다 — /_next/static 캐시 전략이 프로덕션의
      // 콘텐츠 해시 파일명을 전제로 하는데, dev 서버의 청크는 그렇지 않아서
      // 서비스 워커가 재빌드 전 코드를 계속 서빙하는 문제가 생긴다. 예전에
      // 등록된 서비스 워커가 남아있다면 등록 해제해 스스로 정리한다.
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        })
        .catch(() => {});
      return;
    }

    // 새 배포가 올라왔는지 앱을 열 때마다 확인한다. 예전 서비스 워커가
    // 잘못된 응답을 캐시해 화면이 깨진 경우, 이 확인이 있어야 스스로 회복된다.
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.update())
      .catch((error) => {
        console.error("서비스 워커 등록 실패:", error);
      });

    // 새 서비스 워커가 제어를 넘겨받으면 한 번만 새로고침해서
    // 지금 화면이 예전 캐시로 만든 자산을 쓰지 않도록 한다.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let hasReloaded = false;

    function handleControllerChange() {
      if (!hadController || hasReloaded) return;
      hasReloaded = true;
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    return () =>
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
  }, []);

  return null;
}
