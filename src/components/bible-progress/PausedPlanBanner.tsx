"use client";

import { PauseCircle } from "lucide-react";
import { useTogglePauseBiblePlan } from "@/hooks/useTogglePauseBiblePlan";

interface PausedPlanBannerProps {
  memberPlanId: string;
  pausedSinceLabel: string | null;
}

export function PausedPlanBanner({
  memberPlanId,
  pausedSinceLabel,
}: PausedPlanBannerProps) {
  const { mutate: togglePause, isPending, error } = useTogglePauseBiblePlan();

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-surface-dim bg-surface-container-low p-4">
      <div className="flex items-center gap-2 text-foreground">
        <PauseCircle className="h-5 w-5 text-muted-foreground" />
        <span className="text-body-md font-medium">
          통독을 잠시 쉬는 중이에요
        </span>
      </div>
      <p className="text-label-sm text-muted-foreground">
        {pausedSinceLabel ? `${pausedSinceLabel} ` : ""}쉬는 동안에는 분량이
        밀리지 않아요. 다시 시작하면 멈춘 지점부터 이어서 읽어요.
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => togglePause({ memberPlanId, isPaused: true })}
        className="rounded-md bg-primary py-3 text-label-sm font-medium text-primary-foreground transition-transform active:scale-95 disabled:opacity-60"
      >
        {isPending ? "다시 시작하는 중..." : "다시 시작"}
      </button>
      {error && (
        <p className="text-label-sm text-destructive">
          {error instanceof Error ? error.message : "다시 시작하지 못했어요."}
        </p>
      )}
    </section>
  );
}
