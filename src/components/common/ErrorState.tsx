"use client";

import { RotateCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorState({ message, onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background px-margin-main text-center">
      <p className="text-body-md text-muted-foreground">
        {message ?? "데이터를 불러오지 못했어요."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-label-sm text-foreground transition-colors hover:bg-surface-container-low disabled:opacity-50"
      >
        <RotateCw className="h-4 w-4" />
        다시 시도
      </button>
    </div>
  );
}
