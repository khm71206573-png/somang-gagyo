"use client";

import Image from "next/image";
import { Hand, Trash2 } from "lucide-react";
import type { PrayerRequestItem } from "@/lib/mock-data";
import { useTogglePrayerReaction } from "@/hooks/useTogglePrayerReaction";
import { useDeletePrayerRequest } from "@/hooks/useDeletePrayerRequest";

interface PrayerRequestCardProps {
  item: PrayerRequestItem;
}

export function PrayerRequestCard({ item }: PrayerRequestCardProps) {
  const { mutate, isPending } = useTogglePrayerReaction();
  const { mutate: deletePrayerRequest, isPending: isDeleting } =
    useDeletePrayerRequest();

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-outline-variant/20 bg-card p-5 shadow-[0_2px_10px_rgba(44,44,44,0.04)]">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={item.avatarUrl}
            alt={item.author}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full bg-surface-container object-cover"
          />
          <div>
            <p className="text-label-sm font-semibold text-foreground">
              {item.author}
            </p>
            <p className="text-[11px] text-muted-foreground">{item.timeAgo}</p>
          </div>
        </div>
        {item.isMine && (
          <button
            type="button"
            aria-label="기도제목 삭제"
            disabled={isDeleting}
            onClick={() => {
              if (window.confirm("이 기도제목을 삭제할까요?")) {
                deletePrayerRequest(item.id);
              }
            }}
            className="text-outline transition-colors hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      <div className="mt-1 flex flex-col gap-2">
        <span className="w-max rounded-full bg-surface-container-highest px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {item.category}
        </span>
        <p className="line-clamp-3 text-body-md leading-relaxed text-foreground">
          {item.content}
        </p>
      </div>

      <footer className="mt-2 flex items-center justify-between border-t border-outline-variant/30 pt-3">
        <button
          type="button"
          disabled={isPending}
          aria-pressed={item.hasReacted}
          onClick={() =>
            mutate({ prayerRequestId: item.id, hasReacted: item.hasReacted })
          }
          className={
            item.hasReacted
              ? "flex items-center gap-1.5 rounded-md border border-cta/30 bg-cta/10 px-4 py-2 text-cta transition-colors active:scale-95 disabled:opacity-60"
              : "flex items-center gap-1.5 rounded-md border border-outline-variant px-4 py-2 text-muted-foreground transition-colors hover:bg-surface-container-low active:scale-95 disabled:opacity-60"
          }
        >
          <Hand
            className="h-[18px] w-[18px]"
            fill={item.hasReacted ? "currentColor" : "none"}
          />
          <span className="text-[12px]">
            {item.hasReacted ? "기도 중" : "함께 기도하기"}
          </span>
        </button>
        <p className="text-[12px] text-muted-foreground">
          <span className="font-semibold text-primary">
            {item.participantCount}명
          </span>{" "}
          참여
        </p>
      </footer>
    </article>
  );
}
