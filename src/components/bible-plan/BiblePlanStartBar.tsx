"use client";

import { useState } from "react";

interface BiblePlanStartBarProps {
  selectedPlanTitle: string | null;
  startedAt: string;
  onStartedAtChange: (value: string) => void;
  onStart: () => void;
  isPending: boolean;
  error: string | null;
}

export function BiblePlanStartBar({
  selectedPlanTitle,
  startedAt,
  onStartedAtChange,
  onStart,
  isPending,
  error,
}: BiblePlanStartBarProps) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const isToday = startedAt === new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-x-0 bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-outline-variant/30 bg-card/90 px-margin-main py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-3 px-2">
        {isEditingDate ? (
          <input
            type="date"
            value={startedAt}
            autoFocus
            onChange={(event) => onStartedAtChange(event.target.value)}
            onBlur={() => setIsEditingDate(false)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-body-md text-foreground focus:border-primary focus:outline-none"
          />
        ) : (
          <span className="text-body-md text-foreground">
            시작일: {isToday ? "오늘부터" : startedAt}
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsEditingDate((value) => !value)}
          className="shrink-0 text-label-sm text-outline underline decoration-outline/50 underline-offset-4 transition-colors hover:text-primary"
        >
          {isEditingDate ? "완료" : "변경"}
        </button>
      </div>

      {error && <p className="mb-2 px-2 text-label-sm text-destructive">{error}</p>}

      <button
        type="button"
        disabled={!selectedPlanTitle || isPending}
        onClick={onStart}
        className={
          selectedPlanTitle && !isPending
            ? "flex w-full items-center justify-center rounded-md bg-primary py-4 text-title-lg text-primary-foreground transition-all duration-200 active:scale-[0.99]"
            : "flex w-full cursor-not-allowed items-center justify-center rounded-md bg-surface-container-highest py-4 text-title-lg text-muted-foreground opacity-70"
        }
      >
        {isPending
          ? "시작하는 중..."
          : selectedPlanTitle
            ? `${selectedPlanTitle} 시작하기`
            : "플랜을 선택해주세요"}
      </button>
    </div>
  );
}
