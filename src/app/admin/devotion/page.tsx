"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useDevotionList } from "@/hooks/useDevotionList";
import { useDeleteDevotion } from "@/hooks/useDeleteDevotion";
import { devotionSourceLabels, toDevotionSource } from "@/lib/devotionSource";

export default function DevotionListPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useDevotionList();
  const { mutate: deleteDevotion, isPending: isDeleting, variables: deletingId } =
    useDeleteDevotion();

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
      <AdminFormTopBar title="묵상 관리" />
      <main className="flex flex-col gap-stack-md px-margin-main pt-stack-sm">
        <div className="flex justify-end">
          <Link
            href="/admin/devotion/new"
            className="text-label-sm font-medium text-primary"
          >
            + 새로 등록
          </Link>
        </div>

        {data.length === 0 ? (
          <p className="rounded-md border border-outline-variant/40 bg-card p-4 text-center text-label-sm text-muted-foreground">
            등록된 묵상이 없어요.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-outline-variant/40 bg-card shadow-[0px_4px_14px_rgba(44,44,44,0.03)]">
            {data.map((item, index) => {
              // 같은 날 매일성경과 QT가 나란히 있을 수 있어 출처를 함께 보여준다.
              const sourceLabel = devotionSourceLabels[toDevotionSource(item.source)];

              return (
              <div
                key={item.id}
                className={
                  index === data.length - 1
                    ? "flex items-center justify-between p-4"
                    : "flex items-center justify-between border-b border-outline-variant/30 p-4"
                }
              >
                <div>
                  <p className="text-body-md font-medium text-foreground">{item.title}</p>
                  <p className="text-label-sm text-muted-foreground">
                    {item.devotion_date} · {sourceLabel}
                    {item.tag && item.tag !== sourceLabel && ` · ${item.tag}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/devotion/${item.id}`}
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
                        deleteDevotion(item.id);
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
