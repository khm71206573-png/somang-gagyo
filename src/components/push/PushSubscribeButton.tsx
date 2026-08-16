"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { usePushSubscription } from "@/hooks/usePushSubscription";

export function PushSubscribeButton() {
  const { permission, isSubscribed, isLoading, isBusy, error, subscribe, unsubscribe } =
    usePushSubscription();

  if (permission === "unsupported" || isLoading) {
    return null;
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface-container-low px-4 py-3 text-label-sm text-muted-foreground">
        <BellOff className="h-4 w-4 shrink-0" />
        <span>알림이 차단되어 있어요. 브라우저 설정에서 알림 권한을 허용해주세요.</span>
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={unsubscribe}
          disabled={isBusy}
          className="flex items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-label-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
        >
          <BellRing className="h-4 w-4" />
          알림 받는 중 · 끄기
        </button>
        {error && <p className="text-label-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={subscribe}
        disabled={isBusy}
        className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Bell className="h-4 w-4" />
        알림 받기
      </button>
      {error && <p className="text-label-sm text-destructive">{error}</p>}
    </div>
  );
}
