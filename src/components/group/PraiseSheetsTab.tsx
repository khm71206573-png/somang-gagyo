"use client";

import { useRef, useState } from "react";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import type { PraiseSheet } from "@/lib/mock-data";
import { useIsAdmin } from "@/hooks/useProfile";
import { useUploadSheetMusic } from "@/hooks/useUploadSheetMusic";
import { useDeleteSheetMusic } from "@/hooks/useDeleteSheetMusic";

interface PraiseSheetsTabProps {
  sheets: PraiseSheet[];
  sermonId: string | null;
}

export function PraiseSheetsTab({ sheets, sermonId }: PraiseSheetsTabProps) {
  const isAdmin = useIsAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutate: uploadSheetMusic, isPending: isUploading } = useUploadSheetMusic();
  const { mutate: deleteSheetMusic, isPending: isDeleting, variables: deletingId } =
    useDeleteSheetMusic();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !sermonId) return;

    setError(null);
    uploadSheetMusic(
      { file, sermonId },
      { onError: (err) => setError(err instanceof Error ? err.message : "업로드에 실패했어요.") },
    );
  }

  return (
    <section className="space-y-stack-md">
      {sheets.length === 0 && (
        <p className="py-stack-lg text-center text-body-md text-muted-foreground">
          등록된 악보가 아직 없어요.
        </p>
      )}

      {sheets.map((sheet) => (
        <div
          key={sheet.id}
          className="flex flex-col gap-3 rounded-lg border border-outline-variant/30 bg-card p-4 shadow-[0px_4px_20px_rgba(44,44,44,0.04)]"
        >
          <div className="flex items-center justify-between">
            <div>
              {sheet.key && (
                <div className="mb-1 inline-block rounded bg-success-container px-2 py-0.5 text-[11px] font-bold text-success-container-foreground">
                  {sheet.key}
                </div>
              )}
              <h3 className="text-body-lg text-foreground">{sheet.title}</h3>
            </div>
            {isAdmin && (
              <button
                type="button"
                aria-label="악보 삭제"
                disabled={isDeleting && deletingId === sheet.id}
                onClick={() => {
                  if (window.confirm("이 악보를 삭제할까요?")) {
                    deleteSheetMusic(sheet.id);
                  }
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {sheet.sheetUrl && (
            <a href={sheet.sheetUrl} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sheet.sheetUrl}
                alt={sheet.title}
                className="w-full rounded-md border border-outline-variant/40"
              />
            </a>
          )}
        </div>
      ))}

      {isAdmin && !sermonId && (
        <p className="rounded-md border border-outline-variant/40 bg-card p-4 text-center text-label-sm text-muted-foreground">
          설교를 먼저 등록해야 악보를 추가할 수 있어요.
        </p>
      )}

      {isAdmin && sermonId && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
            {isUploading ? "업로드 중..." : "악보 사진 추가"}
          </button>
          {error && <p className="mt-2 text-label-sm text-destructive">{error}</p>}
        </div>
      )}
    </section>
  );
}
