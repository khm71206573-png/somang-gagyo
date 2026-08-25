"use client";

import { AnnouncementTopBar } from "@/components/announcement/AnnouncementTopBar";
import { AnnouncementCard } from "@/components/announcement/AnnouncementCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useAnnouncementList } from "@/hooks/useAnnouncementList";

export default function AnnouncementListPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAnnouncementList();

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] overflow-x-hidden bg-background pb-[100px]">
      <AnnouncementTopBar />
      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : data.length === 0 ? (
        <p className="px-margin-main py-stack-lg text-center text-body-md text-muted-foreground">
          아직 올라온 공지가 없어요.
        </p>
      ) : (
        <main className="flex flex-col gap-stack-md px-margin-main py-stack-md">
          {data.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
        </main>
      )}
      <BottomNav active="더보기" />
    </div>
  );
}
