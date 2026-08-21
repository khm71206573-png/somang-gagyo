"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useSongList } from "@/hooks/useSongList";
import { useDeleteSong } from "@/hooks/useDeleteSong";

export default function SongListPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useSongList();
  const { mutate: deleteSong, isPending: isDeleting, variables: deletingId } =
    useDeleteSong();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-stack-lg">
      <AdminFormTopBar title="찬양 관리" />
      <main className="flex flex-col gap-stack-md px-margin-main pt-stack-sm">
        <div className="flex justify-end">
          <Link
            href="/admin/song/new"
            className="text-label-sm font-medium text-primary"
          >
            + 새로 등록
          </Link>
        </div>

        {data.length === 0 ? (
          <p className="rounded-md border border-outline-variant/40 bg-card p-4 text-center text-label-sm text-muted-foreground">
            등록된 찬양이 없어요.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-outline-variant/40 bg-card shadow-[0px_4px_14px_rgba(44,44,44,0.03)]">
            {data.map((item, index) => (
              <div
                key={item.id}
                className={
                  index === data.length - 1
                    ? "flex items-center justify-between p-4"
                    : "flex items-center justify-between border-b border-outline-variant/30 p-4"
                }
              >
                <div>
                  <p className="text-body-md font-medium text-foreground">
                    {item.songs?.title ?? "(제목 없음)"}
                    {item.songs?.artist && (
                      <span className="ml-1.5 text-label-sm font-normal text-muted-foreground">
                        · {item.songs.artist}
                      </span>
                    )}
                  </p>
                  <p className="text-label-sm text-muted-foreground">{item.song_date}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/song/${item.id}`}
                    aria-label="수정"
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-container-highest text-muted-foreground transition-colors hover:bg-surface-dim"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    aria-label="삭제"
                    disabled={isDeleting && deletingId === item.id}
                    onClick={() => {
                      if (window.confirm("삭제할까요?")) {
                        deleteSong(item.id);
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-container-highest text-muted-foreground transition-colors hover:bg-surface-dim disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
