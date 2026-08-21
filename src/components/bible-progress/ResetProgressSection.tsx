"use client";

import { RotateCcw } from "lucide-react";
import { useResetBiblePlan } from "@/hooks/useResetBiblePlan";

interface ResetProgressSectionProps {
  memberPlanId: string;
}

export function ResetProgressSection({ memberPlanId }: ResetProgressSectionProps) {
  const { mutate: resetPlan, isPending, isSuccess, error } = useResetBiblePlan();

  return (
    <section className="flex flex-col gap-2 pb-8">
      <h3 className="text-title-lg text-foreground">통독 초기화</h3>
      <p className="text-label-sm text-muted-foreground">
        지금까지의 완독 기록을 모두 지우고 오늘부터 1일차로 다시 시작해요. 플랜은
        그대로 유지되고, 지운 기록은 되돌릴 수 없어요.
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (
            window.confirm(
              "완독 기록을 모두 지우고 1일차부터 다시 시작할까요? 되돌릴 수 없어요.",
            )
          ) {
            resetPlan({ memberPlanId });
          }
        }}
        className="mt-1 flex items-center justify-center gap-2 rounded-md border border-destructive bg-card py-3 text-label-sm font-medium text-destructive transition-transform active:scale-95 disabled:opacity-60"
      >
        <RotateCcw className="h-4 w-4" />
        {isPending ? "초기화하는 중..." : "통독 초기화"}
      </button>
      {error && (
        <p className="text-label-sm text-destructive">
          {error instanceof Error ? error.message : "초기화하지 못했어요."}
        </p>
      )}
      {isSuccess && !error && (
        <p className="text-label-sm text-muted-foreground">
          초기화했어요. 오늘이 1일차예요.
        </p>
      )}
    </section>
  );
}
