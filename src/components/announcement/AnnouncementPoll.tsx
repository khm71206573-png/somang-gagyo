"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useToggleAnnouncementVote } from "@/hooks/useToggleAnnouncementVote";
import type { AnnouncementDetail } from "@/lib/supabase/queries/announcement";

interface AnnouncementPollProps {
  announcement: AnnouncementDetail;
}

export function AnnouncementPoll({ announcement }: AnnouncementPollProps) {
  const { mutate, isPending, variables } = useToggleAnnouncementVote();
  const [error, setError] = useState<string | null>(null);

  const { options, voterCount, allowMultiple, isClosed, pollType } = announcement;

  return (
    <section className="flex flex-col gap-stack-sm">
      <div className="flex items-end justify-between">
        <h2 className="text-title-lg text-foreground">
          {pollType === "schedule" ? "가능한 일정을 골라주세요" : "투표해주세요"}
        </h2>
        <span className="text-label-sm text-primary">{voterCount}명 참여</span>
      </div>

      <p className="text-[12px] text-muted-foreground">
        {isClosed
          ? "마감된 투표예요. 결과만 볼 수 있어요."
          : allowMultiple
            ? "여러 개를 고를 수 있어요. 다시 누르면 선택이 취소돼요."
            : "한 개만 고를 수 있어요. 다시 누르면 선택이 취소돼요."}
      </p>

      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const percent =
            voterCount > 0 ? Math.round((option.voteCount / voterCount) * 100) : 0;
          const isSubmitting = isPending && variables?.optionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={isClosed || isPending}
              aria-pressed={option.isSelected}
              onClick={() => {
                setError(null);
                mutate(
                  {
                    announcementId: announcement.id,
                    optionId: option.id,
                    isSelected: option.isSelected,
                    allowMultiple,
                  },
                  {
                    onError: (err) =>
                      setError(
                        err instanceof Error ? err.message : "투표하지 못했어요.",
                      ),
                  },
                );
              }}
              className={
                option.isSelected
                  ? "relative flex flex-col gap-1.5 overflow-hidden rounded-lg border-2 border-primary bg-card p-4 text-left transition-transform active:scale-[0.99] disabled:opacity-70"
                  : "relative flex flex-col gap-1.5 overflow-hidden rounded-lg border border-outline-variant bg-card p-4 text-left transition-colors hover:bg-surface-container-low active:scale-[0.99] disabled:opacity-70"
              }
            >
              {/* 득표율 막대 (배경) */}
              <span
                aria-hidden
                className={
                  option.isSelected
                    ? "absolute inset-y-0 left-0 bg-primary/12"
                    : "absolute inset-y-0 left-0 bg-surface-container-high"
                }
                style={{ width: `${percent}%` }}
              />
              <span className="relative flex items-center gap-2">
                <span
                  className={
                    option.isSelected
                      ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-outline"
                  }
                >
                  {option.isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className="flex-1 text-body-md font-medium text-foreground">
                  {option.label}
                </span>
                <span className="shrink-0 text-label-sm font-semibold text-primary">
                  {isSubmitting ? "..." : `${option.voteCount}명`}
                </span>
              </span>
              {option.voterNames.length > 0 && (
                <span className="relative pl-7 text-[11px] leading-snug text-muted-foreground">
                  {option.voterNames.join(", ")}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="text-label-sm text-destructive">{error}</p>}
    </section>
  );
}
