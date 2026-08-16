import Image from "next/image";
import { CheckCircle2, Hand, Heart } from "lucide-react";
import type { PrayerRequestItem } from "@/lib/mock-data";

interface PrayerRequestCardProps {
  item: PrayerRequestItem;
}

export function PrayerRequestCard({ item }: PrayerRequestCardProps) {
  const isAnswered = item.status === "answered";
  const isPraying = item.status === "praying";

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
        {isAnswered && (
          <span className="flex items-center gap-1 rounded-md border border-success/20 bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">
            <CheckCircle2 className="h-3 w-3" />
            응답됨
          </span>
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
        {isAnswered ? (
          <button
            type="button"
            disabled
            className="flex cursor-default items-center gap-1.5 rounded-md bg-surface-container-low px-4 py-2 text-muted-foreground opacity-70"
          >
            <Heart className="h-[18px] w-[18px]" />
            <span className="text-[12px]">감사해요</span>
          </button>
        ) : isPraying ? (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-cta/30 bg-cta/10 px-4 py-2 text-cta transition-colors active:scale-95"
          >
            <Hand className="h-[18px] w-[18px]" fill="currentColor" />
            <span className="text-[12px]">기도 중</span>
          </button>
        ) : (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-outline-variant px-4 py-2 text-muted-foreground transition-colors hover:bg-surface-container-low active:scale-95"
          >
            <Hand className="h-[18px] w-[18px]" />
            <span className="text-[12px]">함께 기도하기</span>
          </button>
        )}
        <p className="text-[12px] text-muted-foreground">
          <span
            className={
              isAnswered
                ? "font-semibold text-success"
                : "font-semibold text-primary"
            }
          >
            {item.participantCount}명
          </span>{" "}
          참여
        </p>
      </footer>
    </article>
  );
}
