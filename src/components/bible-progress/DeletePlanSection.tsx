"use client";

import { Trash2 } from "lucide-react";
import { useDeleteBiblePlan } from "@/hooks/useDeleteBiblePlan";

interface DeletePlanSectionProps {
  memberPlanId: string;
  planLabel: string;
}

export function DeletePlanSection({
  memberPlanId,
  planLabel,
}: DeletePlanSectionProps) {
  const { mutate: deletePlan, isPending, error } = useDeleteBiblePlan();

  return (
    <section className="flex flex-col gap-2 pb-8">
      <h3 className="text-title-lg text-foreground">통독 플랜 삭제</h3>
      <p className="text-label-sm text-muted-foreground">
        지금 선택된 <span className="font-medium text-foreground">{planLabel}</span>{" "}
        플랜을 완독 기록과 함께 지워요. 삭제하면 통독을 하지 않는 상태가 되고,
        새 플랜을 다시 고를 수 있어요. 지운 기록은 되돌릴 수 없어요.
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (
            window.confirm(
              `"${planLabel}" 플랜을 완독 기록까지 삭제할까요? 되돌릴 수 없어요.`,
            )
          ) {
            deletePlan({ memberPlanId });
          }
        }}
        className="mt-1 flex items-center justify-center gap-2 rounded-md bg-destructive py-3 text-label-sm font-medium text-destructive-foreground transition-transform active:scale-95 disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
        {isPending ? "삭제하는 중..." : "통독 플랜 삭제"}
      </button>
      {error && (
        <p className="text-label-sm text-destructive">
          {error instanceof Error ? error.message : "삭제하지 못했어요."}
        </p>
      )}
    </section>
  );
}
