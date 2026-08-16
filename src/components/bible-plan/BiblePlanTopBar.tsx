"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BiblePlanTopBar() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-background/90 pb-stack-sm pt-4 backdrop-blur-md">
      <div className="flex h-14 items-center px-margin-main">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => router.back()}
          className="-ml-2 flex items-center justify-center rounded-full p-2 text-foreground transition-colors hover:bg-surface-container-low"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="mr-8 flex-1 text-center text-title-lg text-foreground">
          통독 플랜 선택
        </h1>
      </div>
      <div className="mt-stack-sm flex flex-col items-center px-margin-main">
        <p className="text-center text-body-lg text-foreground">
          나에게 맞는 속도를 골라보세요
        </p>
        <p className="mt-1 text-center text-label-sm text-outline">
          언제든 바꿀 수 있어요
        </p>
      </div>
    </header>
  );
}
