"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, RotateCw, Trash2 } from "lucide-react";
import { FontScaleControl } from "@/components/common/FontScaleControl";
import { useFontScale } from "@/hooks/useFontScale";
import { useIsAdmin } from "@/hooks/useProfile";
import { useSermonSummaries } from "@/hooks/useSermonSummaries";
import { useCreateSermonSummary } from "@/hooks/useCreateSermonSummary";
import { useDeleteSermonSummary } from "@/hooks/useDeleteSermonSummary";
import type { SermonSummaryPost } from "@/lib/supabase/queries/sermonSummaries";

const FONT_SCALE_STORAGE_KEY = "sermon-summary-font-scale";

/** 게시판 목록에서 한 줄 미리보기로 쓸 첫 줄 */
function previewOf(content: string) {
  return content.trim().split("\n")[0] ?? "";
}

function DeleteSummaryButton({
  post,
  isDeleting,
  onDelete,
}: {
  post: SermonSummaryPost;
  isDeleting: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <button
      type="button"
      aria-label="설교요약 삭제"
      disabled={isDeleting}
      onClick={(event) => {
        event.stopPropagation();
        onDelete(post.id);
      }}
      className="shrink-0 text-outline transition-colors hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function SermonSummaryTab() {
  const isAdmin = useIsAdmin();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useSermonSummaries();
  const { mutate: createSummary, isPending: isCreating, error: createError } =
    useCreateSermonSummary();
  const { mutate: deleteSummary, isPending: isDeleting, variables: deletingId } =
    useDeleteSermonSummary();
  const { scale, scaleIndex, canDecrease, canIncrease, changeScale } =
    useFontScale(FONT_SCALE_STORAGE_KEY);

  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [openArchiveId, setOpenArchiveId] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (!content.trim()) {
      setLocalError("내용을 입력해주세요.");
      return;
    }

    createSummary(content, { onSuccess: () => setContent("") });
  }

  function handleDelete(id: string) {
    if (window.confirm("이 설교요약을 삭제할까요?")) {
      deleteSummary(id);
    }
  }

  const submitErrorMessage =
    localError ?? (createError instanceof Error ? createError.message : null);

  // 최신 글만 펼쳐 보여주고, 지난 글은 게시판처럼 접어 둔다.
  const latestPost = data?.[0] ?? null;
  const pastPosts = data?.slice(1) ?? [];

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
      ) : !latestPost ? (
        <p className="py-stack-lg text-center text-body-md text-muted-foreground">
          등록된 설교요약이 아직 없어요.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <article className="flex flex-col gap-3 rounded-lg border border-outline-variant/30 bg-card p-4 shadow-[0px_4px_20px_rgba(44,44,44,0.04)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-label-sm text-muted-foreground">
                {latestPost.authorName} · {latestPost.timeAgo}
              </p>
              <div className="flex items-center gap-2">
                <FontScaleControl
                  label={scale.label}
                  canDecrease={canDecrease}
                  canIncrease={canIncrease}
                  onDecrease={() => changeScale(scaleIndex - 1)}
                  onIncrease={() => changeScale(scaleIndex + 1)}
                />
                {isAdmin && (
                  <DeleteSummaryButton
                    post={latestPost}
                    isDeleting={isDeleting && deletingId === latestPost.id}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            </div>
            <p
              className={`whitespace-pre-wrap text-foreground ${scale.className}`}
            >
              {latestPost.content}
            </p>
          </article>

          {pastPosts.length > 0 && (
            <div className="rounded-lg border border-outline-variant/30 bg-card shadow-[0px_4px_20px_rgba(44,44,44,0.04)]">
              <button
                type="button"
                onClick={() => setIsArchiveOpen((open) => !open)}
                aria-expanded={isArchiveOpen}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-label-sm font-medium text-foreground transition-colors hover:bg-surface-container-low"
              >
                <span>이전 설교요약 {pastPosts.length}개</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    isArchiveOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isArchiveOpen && (
                <ul className="border-t border-outline-variant/30">
                  {pastPosts.map((post) => {
                    const isOpen = openArchiveId === post.id;

                    return (
                      <li
                        key={post.id}
                        className="border-b border-outline-variant/20 last:border-b-0"
                      >
                        <div className="flex items-center gap-2 px-4">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenArchiveId(isOpen ? null : post.id)
                            }
                            aria-expanded={isOpen}
                            className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left transition-colors hover:text-primary"
                          >
                            <span className="shrink-0 text-label-sm text-muted-foreground">
                              {post.dateLabel}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-label-sm text-foreground">
                              {previewOf(post.content)}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isAdmin && (
                            <DeleteSummaryButton
                              post={post}
                              isDeleting={isDeleting && deletingId === post.id}
                              onDelete={handleDelete}
                            />
                          )}
                        </div>
                        {isOpen && (
                          <div className="px-4 pb-4">
                            <p className="mb-2 text-label-sm text-muted-foreground">
                              {post.authorName} · {post.timeAgo}
                            </p>
                            <p
                              className={`whitespace-pre-wrap text-foreground ${scale.className}`}
                            >
                              {post.content}
                            </p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
