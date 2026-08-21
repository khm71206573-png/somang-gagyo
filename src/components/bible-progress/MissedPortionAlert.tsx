"use client";

import { AlertCircle } from "lucide-react";
import type { MissedPortionAlert as MissedPortionAlertData } from "@/lib/mock-data";
import { useCatchUpMissedPortion } from "@/hooks/useCatchUpMissedPortion";
import { useSkipMissedPortion } from "@/hooks/useSkipMissedPortion";

interface MissedPortionAlertProps {
  alert: MissedPortionAlertData;
  memberPlanId: string;
}

export function MissedPortionAlert({ alert, memberPlanId }: MissedPortionAlertProps) {
  const { mutate: catchUp, isPending: isCatchingUp, error: catchUpError } =
    useCatchUpMissedPortion();
  const { mutate: skip, isPending: isSkipping, error: skipError } =
    useSkipMissedPortion();

  const isPending = isCatchingUp || isSkipping;
  const error = catchUpError ?? skipError;

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-surface-dim bg-warning-container p-4">
      <div className="flex items-center gap-2 text-warning">
        <AlertCircle className="h-5 w-5" fill="currentColor" />
        <span className="font-medium text-body-md">{alert.message}</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (window.confirm("밀린 분량을 모두 읽은 것으로 표시할까요?")) {
              catchUp(memberPlanId);
            }
          }}
          className="flex-1 rounded-md border border-warning bg-card py-2 text-label-sm text-warning transition-transform active:scale-95 disabled:opacity-60"
        >
          {isCatchingUp ? "처리 중..." : alert.catchUpLabel}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (window.confirm("밀린 분량은 건너뛰고 오늘부터 다시 시작할까요?")) {
              skip(memberPlanId);
            }
          }}
          className="flex-1 rounded-md bg-warning py-2 text-label-sm text-warning-foreground transition-transform active:scale-95 disabled:opacity-60"
        >
          {isSkipping ? "처리 중..." : alert.restartLabel}
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
