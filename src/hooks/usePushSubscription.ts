"use client";

import { useCallback, useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push/urlBase64ToUint8Array";

export type PushPermissionState = "unsupported" | "default" | "denied" | "granted";

export function usePushSubscription() {
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (!cancelled) {
          setPermission("unsupported");
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setPermission(Notification.permission as PushPermissionState);
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!cancelled) setIsSubscribed(Boolean(subscription));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = useCallback(async () => {
    setError(null);

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setError("이 브라우저는 알림을 지원하지 않아요.");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setError("알림 설정이 아직 완료되지 않았어요.");
      return;
    }

    setIsBusy(true);
    try {
      // 권한 요청은 반드시 사용자의 클릭(제스처) 안에서만 호출한다.
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);

      if (result !== "granted") {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const json = subscription.toJSON();

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });

      if (!response.ok) {
        throw new Error("구독 정보를 저장하지 못했어요.");
      }

      setIsSubscribed(true);
    } catch {
      setError("알림 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsBusy(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setError(null);
    setIsBusy(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }

      setIsSubscribed(false);
    } catch {
      setError("알림 해제에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsBusy(false);
    }
  }, []);

  return { permission, isSubscribed, isLoading, isBusy, error, subscribe, unsubscribe };
}
