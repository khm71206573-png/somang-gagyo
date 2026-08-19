"use client";

import { Download } from "lucide-react";
import { useTriggerDevotionScrape } from "@/hooks/useTriggerDevotionScrape";

export function TriggerDevotionScrapeButton() {
  const { mutate, isPending, data, error } = useTriggerDevotionScrape();

  const message = error
    ? error instanceof Error
      ? error.message
      : "오늘의 묵상을 가져오지 못했어요."
    : data?.skipped
      ? "이미 오늘 묵상이 등록되어 있어요."
      : data?.inserted
        ? "묵상을 새로 가져왔어요."
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
        {isPending ? "가져오는 중..." : "오늘의 묵상 지금 가져오기"}
      </button>
      {message && <p className="text-label-sm text-muted-foreground">{message}</p>}
    </section>
  );
}
