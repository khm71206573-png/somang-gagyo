"use client";

import { ListVideo, Play, Trash2 } from "lucide-react";
import { useYoutubePreview } from "@/hooks/useYoutubePreview";
import type { PraiseSetItem } from "@/lib/supabase/queries/praiseSet";

interface PraiseSetLinkCardProps {
  item: PraiseSetItem;
  isAdmin: boolean;
  isDeleting: boolean;
  onDelete: (item: PraiseSetItem) => void;
}

export function PraiseSetLinkCard({
  item,
  isAdmin,
  isDeleting,
  onDelete,
}: PraiseSetLinkCardProps) {
  // 재생목록은 주소만으로 썸네일을 알 수 없어 서버에 한 번 물어본다.
  const { data: preview } = useYoutubePreview(item.youtubeUrl, !item.thumbnailUrl);

  const thumbnailUrl = item.thumbnailUrl ?? preview?.thumbnailUrl ?? null;
  const href = preview?.playUrl ?? item.youtubeUrl ?? undefined;

  return (
    <figure className="overflow-hidden rounded-lg border border-outline-variant/30 bg-card shadow-[0px_4px_20px_rgba(44,44,44,0.04)]">
      <a href={href} target="_blank" rel="noopener noreferrer" className="relative block">
        {thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={thumbnailUrl}
            alt={preview?.title ?? "유튜브 찬양콘티 썸네일"}
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-surface-container">
            <ListVideo className="h-8 w-8 text-muted-foreground" />
            <span className="text-label-sm text-muted-foreground">
              {item.isPlaylist ? "유튜브 재생목록" : "유튜브 링크"}
            </span>
          </div>
        )}

        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white">
            <Play className="h-6 w-6" fill="currentColor" />
          </span>
        </span>

        {item.isPlaylist && (
          <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-[11px] font-medium text-white">
            <ListVideo className="h-3.5 w-3.5" />
            재생목록
          </span>
        )}
      </a>

      <figcaption className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="min-w-0 truncate text-label-sm text-muted-foreground">
          {preview?.title ? `${preview.title} · ` : ""}
          {item.uploaderName} · {item.timeAgo}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity active:opacity-80"
          >
            <Play className="h-3.5 w-3.5" fill="currentColor" />
            {item.isPlaylist ? "전체 재생" : "유튜브로 보기"}
          </a>
          {(item.isMine || isAdmin) && (
            <button
              type="button"
              aria-label="콘티 삭제"
              disabled={isDeleting}
              onClick={() => onDelete(item)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
