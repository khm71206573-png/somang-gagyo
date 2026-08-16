"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Share2 } from "lucide-react";

export function DevotionTopBar() {
  const router = useRouter();

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
        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-container-low"
      >
        <Share2 className="h-5 w-5" />
      </button>
    </header>
  );
}
