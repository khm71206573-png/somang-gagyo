"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

const SHARE_TITLE = "소망가교";
const SHARE_TEXT = "소망가교 앱에서 묵상·통독·기도제목을 함께해요.";

type ShareResult = "shared" | "copied" | null;

export function ShareAppButton() {
  const [result, setResult] = useState<ShareResult>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleShare() {
    setError(null);

    const url = window.location.origin;

    // 폰에서는 기본 공유 시트를 띄우고, 안 되는 브라우저에서는 링크를 복사한다.
    if (navigator.share) {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url });
        setResult("shared");
        return;
      } catch (shareError) {
        // 사용자가 공유 시트를 닫은 경우는 오류가 아니다.
        if (shareError instanceof Error && shareError.name === "AbortError") {
          return;
        }
        // 공유가 막힌 환경이면 아래 복사 방식으로 넘어간다.
      }
    }

    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${url}`);
      setResult("copied");
    } catch {
      setError(`링크를 복사하지 못했어요. 주소를 직접 알려주세요: ${url}`);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center justify-center gap-2 rounded-md border border-primary/30 bg-card px-4 py-3 text-label-sm font-medium text-primary transition-colors hover:bg-primary/10"
      >
        {result === "copied" ? (
          <Check className="h-4 w-4" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {result === "copied" ? "링크를 복사했어요" : "앱 공유하기"}
      </button>
      {error && <p className="text-label-sm text-destructive">{error}</p>}
    </div>
  );
}
