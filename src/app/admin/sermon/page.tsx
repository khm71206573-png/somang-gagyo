"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useSermonList } from "@/hooks/useSermonList";
import { useDeleteSermon } from "@/hooks/useDeleteSermon";
import { useSermonDraftList } from "@/hooks/useSermonDraftList";

export default function SermonListPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useSermonList();
  const { mutate: deleteSermon, isPending: isDeleting, variables: deletingId } =
    useDeleteSermon();
  const { data: drafts } = useSermonDraftList();

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
      <AdminFormTopBar title="설교 관리" />
      <main className="flex flex-col gap-stack-md px-margin-main pt-stack-sm">
        {drafts && drafts.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-body-md font-semibold text-foreground">가져온 설교 초안</h2>
            <div className="overflow-hidden rounded-md border border-outline-variant/40 bg-card shadow-[0px_4px_14px_rgba(44,44,44,0.03)]">
              {drafts.map((draft, index) => (
                <div
                  key={draft.id}
                  className={
                    index === drafts.length - 1
                      ? "flex flex-col gap-2 p-4"
                      : "flex flex-col gap-2 border-b border-outline-variant/30 p-4"
                  }
                >
                  <div>
                    <p className="text-body-md font-medium text-foreground">{draft.title}</p>
                    <p className="text-label-sm text-muted-foreground">{draft.sermon_date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {draft.image_urls.length > 0 && (
                      <a
                        href={draft.image_urls[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-label-sm font-medium text-primary"
                      >
                        원문 이미지 보기
                      </a>
                    )}
                    <Link
                      href={`/admin/sermon/new?draftId=${draft.id}`}
                      className="text-label-sm font-medium text-primary"
                    >
                      이 초안으로 등록하기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Link
            href="/admin/sermon/new"
            className="text-label-sm font-medium text-primary"
          >
            + 새로 등록
          </Link>
        </div>

        {data.length === 0 ? (
          <p className="rounded-md border border-outline-variant/40 bg-card p-4 text-center text-label-sm text-muted-foreground">
            등록된 설교가 없어요.
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
                    {item.title}
                    {item.preacher && (
                      <span className="ml-1.5 text-label-sm font-normal text-muted-foreground">
                        · {item.preacher}
                      </span>
                    )}
                  </p>
                  <p className="text-label-sm text-muted-foreground">{item.sermon_date}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/sermon/${item.id}`}
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
                        deleteSermon(item.id);
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
