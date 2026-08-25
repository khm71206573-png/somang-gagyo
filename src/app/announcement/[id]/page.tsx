"use client";

import { use } from "react";
import { Pin } from "lucide-react";
import { AnnouncementDetailTopBar } from "@/components/announcement/AnnouncementDetailTopBar";
import { AnnouncementKindBadge } from "@/components/announcement/AnnouncementKindBadge";
import { AnnouncementPoll } from "@/components/announcement/AnnouncementPoll";
import { AnnouncementComments } from "@/components/announcement/AnnouncementComments";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useAnnouncement } from "@/hooks/useAnnouncement";
import { useIsAdmin } from "@/hooks/useProfile";

export default function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isAdmin = useIsAdmin();
  const { data, isLoading, isError, error, refetch, isFetching } = useAnnouncement(id);

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
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] overflow-x-hidden bg-background pb-[100px]">
      <AnnouncementDetailTopBar
        editHref={isAdmin ? `/admin/announcement/${data.id}` : undefined}
      />
      <main className="flex flex-col gap-stack-lg px-margin-main pt-stack-sm">
        <article className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {data.isPinned && (
              <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                <Pin className="h-3 w-3" />
                고정
              </span>
            )}
            <AnnouncementKindBadge kind={data.kind} pollType={data.pollType} />
            {data.closesAtLabel && (
              <span
                className={
                  data.isClosed
                    ? "rounded-full bg-surface-container-highest px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    : "rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
                }
              >
                {data.closesAtLabel}
              </span>
            )}
          </div>

          <h2 className="font-heading text-headline-md-mobile text-foreground">
            {data.title}
          </h2>

          <p className="text-label-sm text-muted-foreground">
            {data.authorName} · {data.dateLabel} · {data.timeAgo}
          </p>

          {data.content && (
            <p className="whitespace-pre-wrap text-body-lg leading-relaxed text-foreground">
              {data.content}
            </p>
          )}
        </article>

        {data.kind === "poll" && <AnnouncementPoll announcement={data} />}

        <AnnouncementComments announcementId={data.id} comments={data.comments} />
      </main>
      <BottomNav active="더보기" />
    </div>
  );
}
