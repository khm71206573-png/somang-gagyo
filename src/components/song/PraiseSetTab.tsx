"use client";

import { useRef, useState } from "react";
import { ImageIcon, Link2, Play, Plus, Trash2 } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useIsAdmin } from "@/hooks/useProfile";
import { usePraiseSet } from "@/hooks/usePraiseSet";
import { useUploadPraiseSetImage } from "@/hooks/useUploadPraiseSetImage";
import { useAddPraiseSetLink } from "@/hooks/useAddPraiseSetLink";
import { useDeletePraiseSetItem } from "@/hooks/useDeletePraiseSetItem";
import type { PraiseSetItem } from "@/lib/supabase/queries/praiseSet";

export function PraiseSetTab() {
  const isAdmin = useIsAdmin();
  const { data, isLoading, isError, error, refetch, isFetching } = usePraiseSet();
  const { mutate: uploadImage, isPending: isUploading } = useUploadPraiseSetImage();
  const { mutateAsync: addLink, isPending: isAddingLink } = useAddPraiseSetLink();
  const {
    mutate: deleteItem,
    isPending: isDeleting,
    variables: deletingInput,
  } = useDeletePraiseSetItem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setFormError(null);
    // 여러 장을 한 번에 고르면 고른 순서대로 하나씩 올린다.
    for (const file of files) {
      uploadImage(file, {
        onError: (err) =>
          setFormError(err instanceof Error ? err.message : "사진을 올리지 못했어요."),
      });
    }
  }

  async function handleAddLink(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!linkUrl.trim()) {
      setFormError("유튜브 링크를 입력해주세요.");
      return;
    }

    try {
      await addLink(linkUrl);
      setLinkUrl("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "링크를 등록하지 못했어요.");
    }
  }

  function handleDelete(item: PraiseSetItem) {
    if (!window.confirm("이 콘티를 삭제할까요?")) return;

    setFormError(null);
    deleteItem(
      { id: item.id, storagePath: item.storagePath },
      {
        onError: (err) =>
          setFormError(err instanceof Error ? err.message : "콘티를 삭제하지 못했어요."),
      },
    );
  }

  if (isLoading) {
    return <LoadingState inline />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        inline
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <section className="flex flex-col gap-stack-md">
      <header className="flex items-baseline justify-between">
        <h2 className="text-title-lg text-foreground">
          {data.isThisWeek ? "이번주 찬양콘티" : "지난 찬양콘티"}
        </h2>
        <span className="text-label-sm text-muted-foreground">{data.weekLabel}</span>
      </header>

      {!data.isThisWeek && data.items.length > 0 && (
        <p className="rounded-md border border-outline-variant/40 bg-card p-3 text-label-sm text-muted-foreground">
          이번 주 콘티가 아직 안 올라와서 가장 최근 콘티를 보여주고 있어요.
        </p>
      )}

      {data.items.length === 0 ? (
        <p className="py-stack-lg text-center text-body-md text-muted-foreground">
          아직 올라온 콘티가 없어요. 먼저 올려주세요.
        </p>
      ) : (
        <div className="flex flex-col gap-gutter-card">
          {data.items.map((item) => (
            <figure
              key={item.id}
              className="overflow-hidden rounded-lg border border-outline-variant/30 bg-card shadow-[0px_4px_20px_rgba(44,44,44,0.04)]"
            >
              {item.imageUrl && (
                <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt="찬양콘티" className="w-full" />
                </a>
              )}

              {item.youtubeUrl && (
                <a
                  href={item.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block"
                >
                  {item.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.thumbnailUrl}
                      alt="유튜브 찬양콘티 썸네일"
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-surface-container">
                      <Link2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white">
                      <Play className="h-6 w-6" fill="currentColor" />
                    </span>
                  </span>
                </a>
              )}

              <figcaption className="flex items-center justify-between gap-2 px-4 py-3">
                <span className="min-w-0 truncate text-label-sm text-muted-foreground">
                  {item.uploaderName} · {item.timeAgo}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  {item.youtubeUrl && (
                    <a
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity active:opacity-80"
                    >
                      <Play className="h-3.5 w-3.5" fill="currentColor" />
                      유튜브로 보기
                    </a>
                  )}
                  {(item.isMine || isAdmin) && (
                    <button
                      type="button"
                      aria-label="콘티 삭제"
                      disabled={isDeleting && deletingInput?.id === item.id}
                      onClick={() => handleDelete(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-outline-variant p-4 text-label-sm font-medium text-primary transition-colors hover:bg-surface-container-low disabled:opacity-50"
        >
          {isUploading ? (
            <ImageIcon className="h-4 w-4 animate-pulse" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isUploading ? "올리는 중..." : "콘티 사진 올리기"}
        </button>

        <form onSubmit={handleAddLink} className="flex gap-2">
          <input
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="유튜브 링크 붙여넣기"
            aria-label="유튜브 링크"
            inputMode="url"
            className="min-w-0 flex-1 rounded-md border border-border bg-card px-4 py-3 text-body-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAddingLink}
            className="flex shrink-0 items-center gap-1 rounded-md border border-outline-variant px-4 text-label-sm font-medium text-primary transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            <Link2 className="h-4 w-4" />
            {isAddingLink ? "등록 중..." : "링크 추가"}
          </button>
        </form>

        <p className="text-center text-[11px] text-muted-foreground">
          누구나 올릴 수 있어요. 사진과 유튜브 링크 모두 이번 주 콘티로 저장돼요.
        </p>
        {formError && (
          <p className="text-center text-label-sm text-destructive">{formError}</p>
        )}
      </div>
    </section>
  );
}
