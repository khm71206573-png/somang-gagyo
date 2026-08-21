"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { BibleReadingInfo } from "@/lib/mock-data";
import { useCompleteReading } from "@/hooks/useCompleteReading";

interface BibleReadingCardProps {
  reading: BibleReadingInfo;
}

export function BibleReadingCard({ reading }: BibleReadingCardProps) {
  const { mutate: completeReading, isPending } = useCompleteReading();

  return (
    <Link
      href="/bible-progress"
      className="block rounded-md border border-border bg-card p-5 shadow-[0_4px_20px_-4px_rgba(44,44,44,0.04)] transition-transform duration-200 active:scale-[0.98]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-sm bg-secondary/10 px-2 py-1 text-label-sm text-secondary">
              {reading.tag}
            </span>
            <span className="text-label-sm text-muted-foreground">
              {reading.planName}
            </span>
          </div>
          <h3 className="font-heading text-title-lg text-foreground">
            {reading.passage}
          </h3>
        </div>
        <button
          type="button"
          disabled={isPending || !reading.planDayId}
          aria-pressed={reading.isCompleted}
          onClick={(event) => {
            // 카드 전체가 통독 화면으로 가는 링크라 체크 버튼은 이동을 막는다.
            event.preventDefault();
            event.stopPropagation();
            completeReading({
              memberPlanId: reading.memberPlanId,
              planDayId: reading.planDayId,
              currentDay: reading.currentDay,
              totalDays: reading.totalDays,
              isCompleted: reading.isCompleted,
            });
          }}
          className={
            reading.isCompleted
              ? "flex h-14 w-14 items-center justify-center rounded-full border border-secondary bg-secondary/15 text-secondary transition-colors active:scale-90 disabled:opacity-60"
              : "flex h-14 w-14 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-outline transition-colors hover:bg-secondary/20 active:scale-90 disabled:opacity-60"
          }
          aria-label={reading.isCompleted ? "읽기 완료 취소" : "읽기 완료 표시"}
        >
          <CheckCircle2
            className="h-6 w-6"
            fill={reading.isCompleted ? "currentColor" : "none"}
          />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-label-sm text-muted-foreground">
            {reading.communityProgressLabel}
          </span>
          <span className="text-label-sm font-semibold text-secondary">
            {reading.progressPercent}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="h-1.5 rounded-full bg-secondary"
            style={{ width: `${reading.progressPercent}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
