"use client";

import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

interface AdminAccessDialogProps {
  open: boolean;
  onClose: () => void;
}

/** 관리자가 아닌 교인이 "콘텐츠 관리"를 눌렀을 때 안내하는 팝업 */
export function AdminAccessDialog({ open, onClose }: AdminAccessDialogProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // BottomNav가 z-50이라 같은 층에서는 버튼이 탭에 가린다. 한 단계 위로 띄운다.
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-access-title"
        aria-describedby="admin-access-description"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
        className="relative w-full max-w-[480px] rounded-t-2xl bg-background p-margin-main shadow-[0_-4px_24px_rgba(44,44,44,0.12)] sm:rounded-2xl sm:pb-margin-main"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <h2
            id="admin-access-title"
            className="font-heading text-title-lg text-foreground"
          >
            관리자만 들어갈 수 있어요
          </h2>
          <p
            id="admin-access-description"
            className="text-body-md leading-relaxed text-muted-foreground"
          >
            콘텐츠 관리는 공지·묵상·찬양 등록처럼 교회 전체에 보이는 내용을 다루는
            공간이라 관리자 권한이 필요해요.
            <br />
            맡으신 일이 있어 권한이 필요하시면 담당 관리자에게 관리자 등록을
            요청해주세요.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-stack-md w-full rounded-md bg-primary py-4 text-body-lg font-semibold text-primary-foreground transition-opacity active:opacity-80"
        >
          확인
        </button>
      </div>
    </div>
  );
}
