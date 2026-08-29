"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import type { PraiseSetItem } from "@/lib/supabase/queries/praiseSet";

interface PraiseSheetCarouselProps {
  /** 사진으로 올린 콘티들. 여러 장이면 좌우로 넘겨 본다. */
  items: PraiseSetItem[];
  isAdmin: boolean;
  /** 지우는 중인 콘티 id (버튼 비활성용) */
  deletingId?: string | null;
  onDelete: (item: PraiseSetItem) => void;
}

export function PraiseSheetCarousel({
  items,
  isAdmin,
  deletingId,
  onDelete,
}: PraiseSheetCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const hasMultiple = items.length > 1;

  // 보고 있던 악보가 지워지면 남은 마지막 장으로 옮겨온다.
  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(0, items.length - 1)));
  }, [items.length]);

  function handleScroll() {
    const element = scrollRef.current;
    if (!element || element.clientWidth === 0) return;
    setIndex(Math.round(element.scrollLeft / element.clientWidth));
  }

  function scrollToIndex(next: number) {
    const element = scrollRef.current;
    if (!element) return;

    const clamped = Math.max(0, Math.min(items.length - 1, next));
    element.scrollTo({ left: clamped * element.clientWidth, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <figure
            key={item.id}
            className="w-full shrink-0 snap-center overflow-hidden rounded-lg border border-outline-variant/30 bg-card shadow-[0px_4px_20px_rgba(44,44,44,0.04)]"
          >
            {item.imageUrl && (
              <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt="찬양 악보" className="w-full" />
              </a>
            )}

            <figcaption className="flex items-center justify-between gap-2 px-4 py-3">
              <span className="min-w-0 truncate text-label-sm text-muted-foreground">
                {item.uploaderName} · {item.timeAgo}
              </span>
              {(item.isMine || isAdmin) && (
                <button
                  type="button"
                  aria-label="악보 삭제"
                  disabled={deletingId === item.id}
                  onClick={() => onDelete(item)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {hasMultiple && (
        <>
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-medium text-white">
            {index + 1} / {items.length}
          </span>

          <button
            type="button"
            aria-label="이전 악보"
            disabled={index === 0}
            onClick={() => scrollToIndex(index - 1)}
            className="absolute left-2 top-[45%] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-opacity active:opacity-80 disabled:opacity-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="다음 악보"
            disabled={index === items.length - 1}
            onClick={() => scrollToIndex(index + 1)}
            className="absolute right-2 top-[45%] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-opacity active:opacity-80 disabled:opacity-0"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-2 flex items-center justify-center gap-1.5">
            {items.map((item, dotIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`${dotIndex + 1}번째 악보 보기`}
                aria-current={dotIndex === index}
                onClick={() => scrollToIndex(dotIndex)}
                className={
                  dotIndex === index
                    ? "h-2 w-5 rounded-full bg-primary transition-all"
                    : "h-2 w-2 rounded-full bg-outline-variant transition-all"
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
