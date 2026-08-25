"use client";

import { useEffect, useState } from "react";
import { Check, EyeOff, Pencil } from "lucide-react";
import { useSubmitAnnouncementVote } from "@/hooks/useSubmitAnnouncementVote";
import type { AnnouncementDetail } from "@/lib/supabase/queries/announcement";

interface AnnouncementPollProps {
  announcement: AnnouncementDetail;
}

export function AnnouncementPoll({ announcement }: AnnouncementPollProps) {
  const { mutateAsync, isPending } = useSubmitAnnouncementVote();
  const {
    options,
    voterCount,
    allowMultiple,
    hideVoters,
    isClosed,
    pollType,
    mySelectedOptionIds,
  } = announcement;

  const hasVoted = mySelectedOptionIds.length > 0;
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(mySelectedOptionIds);
  const [error, setError] = useState<string | null>(null);

  // 저장이 끝나 새 데이터가 오면 선택 상태를 서버 값에 맞춘다. (수정 중에는 건드리지 않는다)
  useEffect(() => {
    if (!isEditing) setSelectedIds(mySelectedOptionIds);
  }, [mySelectedOptionIds, isEditing]);

  const isChoosable = !isClosed && (!hasVoted || isEditing);

  function toggleOption(optionId: string) {
    setError(null);
    setSelectedIds((current) => {
      if (current.includes(optionId)) {
        return current.filter((id) => id !== optionId);
      }
      // 단일 선택 투표는 마지막에 고른 하나만 남긴다.
      return allowMultiple ? [...current, optionId] : [optionId];
    });
  }

  async function handleSubmit() {
    setError(null);

    try {
      await mutateAsync({ announcementId: announcement.id, optionIds: selectedIds });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "투표를 저장하지 못했어요.");
    }
  }

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
          : isChoosable
            ? allowMultiple
              ? "여러 개를 고른 뒤 아래 버튼으로 완료해주세요."
              : "하나를 고른 뒤 아래 버튼으로 완료해주세요."
            : "투표를 마쳤어요. 바꾸려면 아래에서 수정해주세요."}
      </p>

      {hideVoters && (
        <p className="flex items-center gap-1 text-[12px] text-muted-foreground">
          <EyeOff className="h-3.5 w-3.5" />
          투표자 이름은 비공개예요. 참여 인원과 득표 수만 보여요.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const percent =
            voterCount > 0 ? Math.round((option.voteCount / voterCount) * 100) : 0;
          const isSelected = selectedIds.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              disabled={!isChoosable || isPending}
              aria-pressed={isSelected}
              onClick={() => toggleOption(option.id)}
              className={
                isSelected
                  ? "relative flex flex-col gap-1.5 overflow-hidden rounded-lg border-2 border-primary bg-card p-4 text-left transition-transform active:scale-[0.99] disabled:active:scale-100"
                  : "relative flex flex-col gap-1.5 overflow-hidden rounded-lg border border-outline-variant bg-card p-4 text-left transition-colors hover:bg-surface-container-low active:scale-[0.99] disabled:hover:bg-card disabled:active:scale-100"
              }
            >
              {/* 득표율 막대 (배경) */}
              <span
                aria-hidden
                className={
                  isSelected
                    ? "absolute inset-y-0 left-0 bg-primary/12"
                    : "absolute inset-y-0 left-0 bg-surface-container-high"
                }
                style={{ width: `${percent}%` }}
              />
              <span className="relative flex items-center gap-2">
                <span
                  className={
                    isSelected
                      ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-outline"
                  }
                >
                  {isSelected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className="flex-1 text-body-md font-medium text-foreground">
                  {option.label}
                </span>
                <span className="shrink-0 text-label-sm font-semibold text-primary">
                  {option.voteCount}명
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

      {!isClosed && (
        <div className="flex gap-2">
          {isChoosable ? (
            <>
              <button
                type="button"
                disabled={isPending || selectedIds.length === 0}
                onClick={handleSubmit}
                className="flex-1 rounded-md bg-primary py-4 text-body-lg font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60"
              >
                {isPending
                  ? "저장 중..."
                  : isEditing
                    ? "수정 완료"
                    : "투표 완료"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setSelectedIds(mySelectedOptionIds);
                    setIsEditing(false);
                    setError(null);
                  }}
                  className="rounded-md border border-outline-variant px-5 text-body-md text-muted-foreground transition-colors hover:bg-surface-container-low disabled:opacity-60"
                >
                  취소
                </button>
              )}
            </>
          ) : (
            <>
              <span className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-secondary/40 bg-secondary/10 py-4 text-body-md font-semibold text-secondary">
                <Check className="h-4 w-4" strokeWidth={3} />
                투표 완료
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-md border border-outline-variant px-5 text-body-md text-muted-foreground transition-colors hover:bg-surface-container-low"
              >
                <Pencil className="h-4 w-4" />
                수정
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
