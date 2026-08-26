"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function GuideTopBar() {
  const router = useRouter();

  return (
    <header className="flex shrink-0 items-center gap-2 px-margin-main pb-stack-sm pt-stack-md">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => {
          // 링크로 바로 들어와 뒤로 갈 곳이 없으면 더보기로 보낸다.
          if (window.history.length > 1) router.back();
          else router.push("/more");
        }}
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-container-low"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 text-title-lg text-foreground">앱 사용 가이드</h1>
    </header>
  );
}
