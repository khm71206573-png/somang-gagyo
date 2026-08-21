"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Share2 } from "lucide-react";

interface DevotionTopBarProps {
  /** 공유 문구에 쓰는 오늘 본문 정보 */
  shareTitle?: string;
  shareText?: string;
}

export function DevotionTopBar({ shareTitle, shareText }: DevotionTopBarProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function handleShare() {
    const url = window.location.href;
    const title = shareTitle ? `오늘의 묵상 · ${shareTitle}` : "오늘의 묵상";
    const text = shareText ? `${shareText}\n\n${url}` : url;

    // 모바일은 기본 공유 시트, 지원하지 않으면 링크를 클립보드에 복사한다.
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText ?? title, url });
        return;
      } catch (error) {
        // 사용자가 공유 시트를 닫은 경우는 실패로 보지 않는다.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-background/90 px-margin-main py-stack-md backdrop-blur-sm">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-container-low"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="text-title-lg text-foreground">오늘의 묵상</h1>
      <button
        type="button"
        aria-label="공유하기"
        onClick={handleShare}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-container-low"
      >
        {copied ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <Share2 className="h-5 w-5" />
        )}
        {copied && (
          <span className="absolute -bottom-6 right-0 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] text-background">
            링크를 복사했어요
          </span>
        )}
      </button>
    </header>
  );
}
