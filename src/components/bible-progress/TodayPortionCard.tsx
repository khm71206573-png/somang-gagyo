"use client";

import { Check, Clock } from "lucide-react";
import type { TodayPortion } from "@/lib/mock-data";

interface TodayPortionCardProps {
  portion: TodayPortion;
  completedToday: boolean;
  isPending: boolean;
  error: string | null;
  onToggleComplete: () => void;
}

export function TodayPortionCard({
  portion,
  completedToday,
  isPending,
  error,
  onToggleComplete,
}: TodayPortionCardProps) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-primary bg-surface-bright p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-accent px-2 py-1 text-label-sm text-primary">
            {portion.tag}
          </span>
          {completedToday && (
            <span className="flex items-center gap-1 rounded-md bg-success-container px-2 py-1 text-label-sm text-success-container-foreground">
              <Check className="h-3 w-3" strokeWidth={3} />
              오늘 완료
            </span>
          )}
        </div>
        {portion.durationLabel && (
          <div className="flex shrink-0 items-center gap-1 text-tertiary">
            <Clock className="h-4 w-4" />
            <span className="text-label-sm">{portion.durationLabel}</span>
          </div>
        )}
      </div>

      <h2 className="mb-6 text-title-lg text-foreground">{portion.passage}</h2>

      {error && <p className="mb-3 text-label-sm text-destructive">{error}</p>}

      <button
        type="button"
        disabled={isPending}
        onClick={onToggleComplete}
        className={
          portion.isCompleted
            ? "flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low py-4 text-body-md font-medium text-muted-foreground transition-transform active:scale-95 disabled:opacity-60"
            : "flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-body-md font-medium text-primary-foreground transition-transform hover:opacity-90 active:scale-95 disabled:opacity-60"
        }
      >
        {!portion.isCompleted && <Check className="h-[18px] w-[18px]" strokeWidth={3} />}
        {isPending
          ? "저장 중..."
          : portion.isCompleted
            ? "완독 표시 취소"
            : portion.actionLabel}
      </button>
    </section>
  );
}
