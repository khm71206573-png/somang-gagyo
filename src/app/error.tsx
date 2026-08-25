"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

/**
 * 화면 한 곳에서 오류가 나도 앱 전체가 하얗게 되지 않도록 받아주는 안전망.
 * (예: 예전 모양의 오프라인 캐시가 새 화면으로 흘러든 경우)
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] 화면 렌더링 실패:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background px-margin-main text-center">
      <p className="text-body-lg font-medium text-foreground">
        화면을 여는 중 문제가 생겼어요.
      </p>
      <p className="text-body-md text-muted-foreground">
        잠시 후 다시 시도해주세요. 계속 같은 화면이 나오면 관리자에게 알려주세요.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-label-sm font-medium text-primary-foreground transition-opacity active:opacity-80"
        >
          <RotateCw className="h-4 w-4" />
          다시 시도
        </button>
        <button
          type="button"
          onClick={() => {
            // 저장된 오프라인 캐시가 원인일 수 있어 비우고 새로 받아온다.
            try {
              window.localStorage.removeItem("hopebridge-offline-cache");
            } catch {
              // 저장소를 못 쓰는 브라우저면 그냥 새로고침만 한다.
            }
            window.location.reload();
          }}
          className="rounded-md border border-border px-4 py-3 text-label-sm text-foreground transition-colors hover:bg-surface-container-low"
        >
          새로고침
        </button>
      </div>
    </div>
  );
}
