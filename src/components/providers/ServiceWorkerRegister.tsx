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

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("서비스 워커 등록 실패:", error);
    });
  }, []);

  return null;
}
