"use client";

import { Download } from "lucide-react";
import { useTriggerSermonScrape } from "@/hooks/useTriggerSermonScrape";

export function TriggerSermonScrapeButton() {
  const { mutate, isPending, data, error } = useTriggerSermonScrape();

  const message = error
    ? error instanceof Error
      ? error.message
      : "새 설교안을 확인하지 못했어요."
    : data?.skipped
      ? `설교안 확인 결과: ${data.reason}`
      : data?.inserted
        ? "새 설교 초안을 가져왔어요! 아래 목록에서 확인하세요."
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
        {isPending ? "확인 중..." : "새 설교안 지금 확인하기"}
      </button>
      {message && <p className="text-label-sm text-muted-foreground">{message}</p>}
    </section>
  );
}
