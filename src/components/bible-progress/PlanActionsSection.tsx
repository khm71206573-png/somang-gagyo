"use client";

import { Pause, Play, RotateCcw, Trash2 } from "lucide-react";
import { useResetBiblePlan } from "@/hooks/useResetBiblePlan";
import { useDeleteBiblePlan } from "@/hooks/useDeleteBiblePlan";
import { useTogglePauseBiblePlan } from "@/hooks/useTogglePauseBiblePlan";

interface PlanActionsSectionProps {
  memberPlanId: string;
  planLabel: string;
  isPaused: boolean;
}

const BUTTON_CLASS =
  "flex flex-col items-center justify-center gap-1 rounded-md border border-outline-variant/50 bg-card py-3 text-label-sm text-foreground transition-transform active:scale-95 disabled:opacity-50";

/** 일시중지·초기화·삭제를 한 줄에 모아 둔 통독 관리 영역 */
export function PlanActionsSection({
  memberPlanId,
  planLabel,
  isPaused,
}: PlanActionsSectionProps) {
  const { mutate: togglePause, isPending: isTogglingPause, error: pauseError } =
    useTogglePauseBiblePlan();
  const { mutate: resetPlan, isPending: isResetting, error: resetError } =
    useResetBiblePlan();
  const { mutate: deletePlan, isPending: isDeleting, error: deleteError } =
    useDeleteBiblePlan();

  const isBusy = isTogglingPause || isResetting || isDeleting;
  const error = pauseError ?? resetError ?? deleteError;

  return (
    <section className="flex flex-col gap-2 pb-8">
      <h3 className="text-title-lg text-foreground">통독 관리</h3>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => togglePause({ memberPlanId, isPaused })}
          className={BUTTON_CLASS}
        >
          {isPaused ? (
            <Play className="h-4 w-4 text-primary" />
          ) : (
            <Pause className="h-4 w-4 text-muted-foreground" />
          )}
          {isPaused ? "다시 시작" : "일시중지"}
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={() => {
            if (
              window.confirm(
                "완독 기록을 모두 지우고 1일차부터 다시 시작할까요? 플랜은 그대로 두고 기록만 지우며, 되돌릴 수 없어요.",
              )
            ) {
              resetPlan({ memberPlanId });
            }
          }}
          className={BUTTON_CLASS}
        >
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
          초기화
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={() => {
            if (
              window.confirm(
                `"${planLabel}" 플랜을 완독 기록까지 삭제할까요? 삭제하면 새 플랜을 다시 고를 수 있고, 되돌릴 수 없어요.`,
              )
            ) {
              deletePlan({ memberPlanId });
            }
          }}
          className={`${BUTTON_CLASS} border-destructive/40 text-destructive`}
        >
          <Trash2 className="h-4 w-4" />
          삭제
        </button>
      </div>
      {error && (
        <p className="text-label-sm text-destructive">
          {error instanceof Error ? error.message : "처리하지 못했어요."}
        </p>
      )}
    </section>
  );
}
