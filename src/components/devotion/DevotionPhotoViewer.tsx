"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";

interface DevotionPhotoViewerProps {
  /** 묵상을 등록할 때 쓴 책 지면 사진 */
  imageUrls: string[];
}

/**
 * 본문은 사진을 글자로 옮긴 것이라 잘못 읽힌 곳이 있을 수 있다.
 * 평소에는 접어 두고, 확인이 필요할 때만 눌러 원본 지면을 본다.
 */
export function DevotionPhotoViewer({ imageUrls }: DevotionPhotoViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasMultiple = imageUrls.length > 1;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    // 사진을 보는 동안 뒤 화면이 따라 움직이지 않게 한다.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleScroll() {
    const element = scrollRef.current;
    if (!element || element.clientWidth === 0) return;
    setIndex(Math.round(element.scrollLeft / element.clientWidth));
  }

  function scrollToIndex(next: number) {
    const element = scrollRef.current;
    if (!element) return;

    const clamped = Math.max(0, Math.min(imageUrls.length - 1, next));
    element.scrollTo({ left: clamped * element.clientWidth, behavior: "smooth" });
  }

  if (imageUrls.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 self-center rounded-full border border-outline-variant/50 px-4 py-2 text-label-sm font-medium text-muted-foreground transition-colors hover:bg-surface-container-low"
      >
        <ImageIcon className="h-4 w-4" />
        원본 사진 보기
      </button>

      {isOpen && (
        // BottomNav가 z-50이라 그 위로 띄운다.
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95">
          <header
            className="flex shrink-0 items-center justify-between px-4 py-3"
            style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
          >
            <p className="text-label-sm text-white/70">
              등록에 쓴 원본 사진
              {hasMultiple && ` · ${index + 1}/${imageUrls.length}`}
            </p>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setIsOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="relative min-h-0 flex-1">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {imageUrls.map((url) => (
                <div
                  key={url}
                  className="h-full w-full shrink-0 snap-center overflow-y-auto"
                >
                  {/* 브라우저 기본 이미지 뷰어로 열면 손가락으로 확대할 수 있다. */}
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="묵상 지면 사진" className="w-full" />
                  </a>
                </div>
              ))}
            </div>

            {hasMultiple && (
              <>
                <button
                  type="button"
                  aria-label="이전 사진"
                  onClick={() => scrollToIndex(index - 1)}
                  disabled={index === 0}
                  className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-opacity disabled:opacity-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="다음 사진"
                  onClick={() => scrollToIndex(index + 1)}
                  disabled={index === imageUrls.length - 1}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-opacity disabled:opacity-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          <p
            className="shrink-0 px-4 py-3 text-center text-label-sm text-white/60"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            사진을 누르면 크게 볼 수 있어요
            {hasMultiple && " · 옆으로 넘겨 다음 장을 봐요"}
          </p>
        </div>
      )}
    </>
  );
}
