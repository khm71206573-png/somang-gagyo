"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Link2, X } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useIsAdmin } from "@/hooks/useProfile";
import { usePraiseSet } from "@/hooks/usePraiseSet";
import {
  useSubmitPraiseSet,
  validatePraiseSetImage,
} from "@/hooks/useSubmitPraiseSet";
import { useDeletePraiseSetItem } from "@/hooks/useDeletePraiseSetItem";
import { PraiseSheetCarousel } from "@/components/song/PraiseSheetCarousel";
import { PraiseSetLinkCard } from "@/components/song/PraiseSetLinkCard";
import type { PraiseSetItem } from "@/lib/supabase/queries/praiseSet";

export function PraiseSetTab() {
  const isAdmin = useIsAdmin();
  const { data, isLoading, isError, error, refetch, isFetching } = usePraiseSet();
  const {
    mutateAsync: submitPraiseSet,
    isPending: isSubmitting,
    progress,
  } = useSubmitPraiseSet();
  const {
    mutate: deleteItem,
    isPending: isDeleting,
    variables: deletingInput,
  } = useDeletePraiseSetItem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 등록 버튼을 누르기 전까지 고른 악보 사진을 여기에 담아둔다.
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // 악보 사진은 좌우로 넘겨 보고, 유튜브 링크는 그 아래에 카드로 쌓는다.
  const sheetItems = useMemo(
    () => (data?.items ?? []).filter((item) => item.imageUrl),
    [data],
  );
  const linkItems = useMemo(
    () => (data?.items ?? []).filter((item) => !item.imageUrl && item.youtubeUrl),
    [data],
  );

  const previews = useMemo(
    () => pendingFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [pendingFiles],
  );

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const invalid = files.map(validatePraiseSetImage).find(Boolean);
    setFormError(invalid ?? null);

    // 문제 있는 파일만 빼고 나머지는 그대로 담아둔다.
    const accepted = files.filter((file) => !validatePraiseSetImage(file));
    if (accepted.length > 0) {
      setPendingFiles((current) => [...current, ...accepted]);
    }
  }

  function handleRemovePending(target: File) {
    setPendingFiles((current) => current.filter((file) => file !== target));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (pendingFiles.length === 0 && !linkUrl.trim()) {
      setFormError("악보 사진이나 유튜브 링크를 추가해주세요.");
      return;
    }

    try {
      await submitPraiseSet({ files: pendingFiles, youtubeUrl: linkUrl });
      setPendingFiles([]);
      setLinkUrl("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "콘티를 등록하지 못했어요.");
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
          <PraiseSheetCarousel
            items={sheetItems}
            isAdmin={isAdmin}
            deletingId={isDeleting ? (deletingInput?.id ?? null) : null}
            onDelete={handleDelete}
          />

          {linkItems.map((item) => (
            <PraiseSetLinkCard
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              isDeleting={isDeleting && deletingInput?.id === item.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          disabled={isSubmitting}
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-outline-variant p-4 text-label-sm font-medium text-primary transition-colors hover:bg-surface-container-low disabled:opacity-50"
        >
          <ImagePlus className="h-4 w-4" />
          악보 사진 고르기
        </button>

        {previews.length > 0 && (
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {previews.map((preview) => (
              <li key={preview.url} className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={preview.file.name}
                  className="h-20 w-20 rounded-md border border-outline-variant/40 object-cover"
                />
                <button
                  type="button"
                  aria-label="고른 사진 빼기"
                  disabled={isSubmitting}
                  onClick={() => handleRemovePending(preview.file)}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background transition-opacity active:opacity-80 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 focus-within:border-primary">
          <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="유튜브 영상·재생목록 링크 (선택)"
            aria-label="유튜브 링크"
            inputMode="url"
            disabled={isSubmitting}
            className="min-w-0 flex-1 bg-transparent text-body-md text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary py-3.5 text-body-lg font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-50"
        >
          {isSubmitting
            ? progress && progress.total > 1
              ? `등록 중... (${progress.done + 1}/${progress.total})`
              : "등록 중..."
            : "등록하기"}
        </button>

        <p className="text-center text-[11px] text-muted-foreground">
          누구나 올릴 수 있어요. 악보 사진과 유튜브 링크를 함께 고른 뒤 등록하기를 누르면
          이번 주 콘티로 저장돼요.
        </p>
        {formError && (
          <p className="text-center text-label-sm text-destructive">{formError}</p>
        )}
      </form>
    </section>
  );
}
