"use client";

import { Download } from "lucide-react";
import { useTriggerSongSync } from "@/hooks/useTriggerSongSync";

export function TriggerSongSyncButton() {
  const { mutate, isPending, data, error } = useTriggerSongSync();

  const message = error
    ? error instanceof Error
      ? error.message
      : "유튜브 좋아요 목록을 동기화하지 못했어요."
    : data?.skipped
      ? `동기화 결과: ${data.reason}`
      : data?.inserted
        ? "오늘의 찬양을 새로 가져왔어요!"
        : null;

  return (
    <section className="flex flex-col gap-stack-sm pb-4">
      <button
        type="button"
        onClick={() => mutate()}
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isPending ? "확인 중..." : "유튜브 좋아요 목록 지금 확인하기"}
      </button>
      {message && <p className="text-label-sm text-muted-foreground">{message}</p>}
    </section>
  );
}
