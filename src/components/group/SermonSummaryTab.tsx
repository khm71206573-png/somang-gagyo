"use client";

import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { RotateCw } from "lucide-react";
import { useIsAdmin } from "@/hooks/useProfile";
import { useSermonSummaries } from "@/hooks/useSermonSummaries";
import { useCreateSermonSummary } from "@/hooks/useCreateSermonSummary";
import { useDeleteSermonSummary } from "@/hooks/useDeleteSermonSummary";

export function SermonSummaryTab() {
  const isAdmin = useIsAdmin();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useSermonSummaries();
  const { mutate: createSummary, isPending: isCreating, error: createError } =
    useCreateSermonSummary();
  const { mutate: deleteSummary, isPending: isDeleting, variables: deletingId } =
    useDeleteSermonSummary();

  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (!content.trim()) {
      setLocalError("내용을 입력해주세요.");
      return;
    }

    createSummary(content, { onSuccess: () => setContent("") });
  }

  const submitErrorMessage =
    localError ?? (createError instanceof Error ? createError.message : null);

  return (
    <section className="flex flex-col gap-stack-md">
      {isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-lg border border-outline-variant/30 bg-card p-4 shadow-[0px_4px_20px_rgba(44,44,44,0.04)]"
        >
          <textarea
            rows={5}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setLocalError(null);
            }}
            placeholder="이번 주 설교요약을 입력해주세요..."
            className="w-full resize-none rounded-md border border-border bg-background p-3 text-body-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          {submitErrorMessage && (
            <p className="text-label-sm text-destructive">{submitErrorMessage}</p>
          )}
          <button
            type="submit"
            disabled={isCreating}
            className="self-end rounded-md bg-primary px-4 py-2 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isCreating ? "등록하는 중..." : "등록"}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-stack-lg">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-stack-lg text-center">
          <p className="text-body-md text-muted-foreground">
            {error instanceof Error ? error.message : "설교요약을 불러오지 못했어요."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-label-sm text-foreground transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            <RotateCw className="h-4 w-4" />
            다시 시도
          </button>
        </div>
      ) : !data || data.length === 0 ? (
        <p className="py-stack-lg text-center text-body-md text-muted-foreground">
          등록된 설교요약이 아직 없어요.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((post) => (
            <article
              key={post.id}
              className="flex flex-col gap-2 rounded-lg border border-outline-variant/30 bg-card p-4 shadow-[0px_4px_20px_rgba(44,44,44,0.04)]"
            >
              <div className="flex items-center justify-between">
                <p className="text-label-sm text-muted-foreground">
                  {post.authorName} · {post.timeAgo}
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    aria-label="설교요약 삭제"
                    disabled={isDeleting && deletingId === post.id}
                    onClick={() => {
                      if (window.confirm("이 설교요약을 삭제할까요?")) {
                        deleteSummary(post.id);
                      }
                    }}
                    className="text-outline transition-colors hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap text-body-md leading-relaxed text-foreground">
                {post.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
