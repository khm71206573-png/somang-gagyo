"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function SongTopBar() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center bg-background/80 px-margin-main backdrop-blur-md">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => router.back()}
        className="-ml-2 mr-4 rounded-full p-2 text-foreground transition-colors hover:bg-surface-container-highest"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="font-heading text-headline-md tracking-tight text-primary">
        On-gi
      </h1>
      <div className="ml-auto text-title-lg text-foreground">
        오늘의 추천 찬양
      </div>
    </header>
  );
}
