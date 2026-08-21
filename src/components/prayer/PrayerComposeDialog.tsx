"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { PRAYER_SCOPE_COMMUNITY, PRAYER_SCOPE_MINE } from "@/lib/mock-data";
import { useCreatePrayerRequest } from "@/hooks/useCreatePrayerRequest";

const SCOPES = [
  {
    value: PRAYER_SCOPE_COMMUNITY,
    description: "가교 식구들과 함께 나눌 기도제목",
  },
  {
    value: PRAYER_SCOPE_MINE,
    description: "내가 붙들고 기도할 개인 기도제목",
  },
];

interface PrayerComposeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PrayerComposeDialog({ open, onClose }: PrayerComposeDialogProps) {
  const { mutateAsync, isPending } = useCreatePrayerRequest();
  const [scope, setScope] = useState(PRAYER_SCOPE_COMMUNITY);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 다시 열 때 이전 입력이 남지 않도록 초기화한다.
  useEffect(() => {
    if (open) {
      setScope(PRAYER_SCOPE_COMMUNITY);
      setContent("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("기도제목 내용을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ scope, content });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요.");
    }
  }

  return (
    // BottomNav가 z-50이라 같은 층에서는 등록 버튼이 탭에 가린다. 한 단계 위로 띄운다.
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prayer-compose-title"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
        className="relative max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-background p-margin-main shadow-[0_-4px_24px_rgba(44,44,44,0.12)] sm:rounded-2xl"
      >
        <header className="mb-stack-md flex items-center justify-between">
          <h2
            id="prayer-compose-title"
            className="font-heading text-title-lg text-foreground"
          >
            기도제목 나누기
          </h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="-mr-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-container-highest"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-label-sm text-foreground">
              어디에 올릴까요?
            </legend>
            <div className="flex gap-2">
              {SCOPES.map((option) => {
                const isSelected = option.value === scope;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setScope(option.value)}
                    className={
                      isSelected
                        ? "flex flex-1 flex-col gap-1 rounded-lg border-2 border-primary bg-primary/5 p-3 text-left transition-colors"
                        : "flex flex-1 flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container p-3 text-left transition-colors hover:bg-surface-container-high"
                    }
                  >
                    <span
                      className={
                        isSelected
                          ? "text-label-sm font-semibold text-primary"
                          : "text-label-sm font-medium text-foreground"
                      }
                    >
                      {option.value}
                    </span>
                    <span className="text-[11px] leading-snug text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <label htmlFor="prayer-content" className="text-label-sm text-foreground">
              내용
            </label>
            <textarea
              id="prayer-content"
              rows={5}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="함께 기도하고 싶은 내용을 적어주세요."
              className="resize-none rounded-md border border-border bg-card px-4 py-3 text-body-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {error && <p className="text-label-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary py-4 text-body-lg font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60"
          >
            {isPending ? "올리는 중..." : "기도제목 올리기"}
          </button>
        </form>
      </div>
    </div>
  );
}
