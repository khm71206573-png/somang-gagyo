"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useAnnouncementAdminList } from "@/hooks/useAnnouncementAdminList";
import { useDeleteAnnouncement } from "@/hooks/useDeleteAnnouncement";

const KIND_LABELS: Record<string, string> = {
  post: "게시글",
  schedule: "일정투표",
  choice: "문항투표",
};

export default function AnnouncementAdminListPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAnnouncementAdminList();
  const {
    mutate: deleteAnnouncement,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteAnnouncement();

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
      <AdminFormTopBar title="공지사항 관리" />
      <main className="flex flex-col gap-stack-md px-margin-main pt-stack-sm">
        <div className="flex justify-end">
          <Link
            href="/admin/announcement/new"
            className="text-label-sm font-medium text-primary"
          >
            + 새로 등록
          </Link>
        </div>

        {data.length === 0 ? (
          <p className="rounded-md border border-outline-variant/40 bg-card p-4 text-center text-label-sm text-muted-foreground">
            등록된 공지가 없어요.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-outline-variant/40 bg-card shadow-[0px_4px_14px_rgba(44,44,44,0.03)]">
            {data.map((item, index) => {
              const kindLabel =
                item.kind === "poll"
                  ? (KIND_LABELS[item.poll_type ?? "choice"] ?? "투표")
                  : KIND_LABELS.post;
              const createdLabel = new Date(item.created_at).toLocaleDateString("ko-KR");

              return (
                <div
                  key={item.id}
                  className={
                    index === data.length - 1
                      ? "flex items-center justify-between gap-3 p-4"
                      : "flex items-center justify-between gap-3 border-b border-outline-variant/30 p-4"
                  }
                >
                  <div className="min-w-0">
                    <p className="truncate text-body-md font-medium text-foreground">
                      {item.is_pinned && <span className="text-primary">[고정] </span>}
                      {item.title}
                    </p>
                    <p className="text-label-sm text-muted-foreground">
                      {kindLabel} · {createdLabel}
                      {item.kind === "poll" &&
                        ` · 항목 ${item.announcement_poll_options.length}개`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/admin/announcement/${item.id}`}
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
                        if (window.confirm("삭제할까요? 투표와 댓글도 함께 지워져요.")) {
                          deleteAnnouncement(item.id);
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-container-highest text-muted-foreground transition-colors hover:bg-surface-dim disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
