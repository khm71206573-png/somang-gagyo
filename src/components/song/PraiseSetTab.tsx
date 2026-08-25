"use client";

import { useRef, useState } from "react";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useIsAdmin } from "@/hooks/useProfile";
import { usePraiseSet } from "@/hooks/usePraiseSet";
import { useUploadPraiseSetImage } from "@/hooks/useUploadPraiseSetImage";
import { useDeletePraiseSetImage } from "@/hooks/useDeletePraiseSetImage";

export function PraiseSetTab() {
  const isAdmin = useIsAdmin();
  const { data, isLoading, isError, error, refetch, isFetching } = usePraiseSet();
  const { mutate: uploadImage, isPending: isUploading } = useUploadPraiseSetImage();
  const {
    mutate: deleteImage,
    isPending: isDeleting,
    variables: deletingInput,
  } = useDeletePraiseSetImage();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

      {!data.isThisWeek && data.images.length > 0 && (
        <p className="rounded-md border border-outline-variant/40 bg-card p-3 text-label-sm text-muted-foreground">
          이번 주 콘티가 아직 안 올라와서 가장 최근 콘티를 보여주고 있어요.
        </p>
      )}

      {data.images.length === 0 ? (
        <p className="py-stack-lg text-center text-body-md text-muted-foreground">
          아직 올라온 콘티가 없어요. 먼저 올려주세요.
        </p>
      ) : (
        <div className="flex flex-col gap-gutter-card">
          {data.images.map((image) => (
            <figure
              key={image.id}
              className="overflow-hidden rounded-lg border border-outline-variant/30 bg-card shadow-[0px_4px_20px_rgba(44,44,44,0.04)]"
            >
              <a href={image.imageUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.imageUrl} alt="찬양콘티" className="w-full" />
              </a>
              <figcaption className="flex items-center justify-between gap-2 px-4 py-3">
                <span className="text-label-sm text-muted-foreground">
                  {image.uploaderName} · {image.timeAgo}
                </span>
                {(image.isMine || isAdmin) && (
                  <button
                    type="button"
                    aria-label="콘티 삭제"
                    disabled={isDeleting && deletingInput?.id === image.id}
                    onClick={() => {
                      if (window.confirm("이 콘티 사진을 삭제할까요?")) {
                        setFormError(null);
                        deleteImage(
                          { id: image.id, storagePath: image.storagePath },
                          {
                            onError: (err) =>
                              setFormError(
                                err instanceof Error
                                  ? err.message
                                  : "사진을 삭제하지 못했어요.",
                              ),
                          },
                        );
                      }
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <div>
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
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          누구나 올릴 수 있어요. 이번 주 콘티로 저장돼요.
        </p>
        {formError && (
          <p className="mt-2 text-center text-label-sm text-destructive">{formError}</p>
        )}
      </div>
    </section>
  );
}
