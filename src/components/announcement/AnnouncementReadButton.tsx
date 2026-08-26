"use client";

import { useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import { useToggleAnnouncementRead } from "@/hooks/useToggleAnnouncementRead";
import type { AnnouncementDetail } from "@/lib/supabase/queries/announcement";

interface AnnouncementReadButtonProps {
  announcement: AnnouncementDetail;
}

/** 공지를 읽었다는 표시. 누른 사람과 인원이 공지 아래에 남는다. */
export function AnnouncementReadButton({
  announcement,
}: AnnouncementReadButtonProps) {
  const { mutateAsync, isPending } = useToggleAnnouncementRead();
  const { id, hasRead, readCount, readerNames } = announcement;
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    try {
      await mutateAsync({ announcementId: id, hasRead });
    } catch (err) {
      setError(err instanceof Error ? err.message : "확인 표시를 하지 못했어요.");
    }
  }

  return (
    <section className="flex flex-col gap-2 rounded-lg border border-outline-variant/40 bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={isPending}
          aria-pressed={hasRead}
          onClick={handleClick}
          className={
            hasRead
              ? "flex flex-1 items-center justify-center gap-1.5 rounded-md border border-secondary/40 bg-secondary/10 py-3 text-body-md font-semibold text-secondary transition-transform active:scale-[0.99] disabled:opacity-60"
              : "flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary py-3 text-body-md font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60"
          }
        >
          {hasRead ? (
            <CheckCheck className="h-4 w-4" strokeWidth={3} />
          ) : (
            <Check className="h-4 w-4" strokeWidth={3} />
          )}
          {hasRead ? "확인했어요" : "확인했어요 누르기"}
        </button>
        <span className="shrink-0 text-label-sm text-muted-foreground">
          <span className="font-semibold text-primary">{readCount}명</span> 확인
        </span>
      </div>

      {readerNames.length > 0 && (
        <p className="text-[11px] leading-snug text-muted-foreground">
          {readerNames.join(", ")}
        </p>
      )}

      {error && <p className="text-label-sm text-destructive">{error}</p>}
    </section>
  );
}
