"use client";

import { PrayerTopBar } from "@/components/prayer/PrayerTopBar";
import { PrayerFilterTabs } from "@/components/prayer/PrayerFilterTabs";
import { PrayerRequestCard } from "@/components/prayer/PrayerRequestCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { prayerFilterTabs, activePrayerFilterTabId } from "@/lib/mock-data";
import { usePrayerRequestList } from "@/hooks/usePrayerRequestList";

export default function PrayerListPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePrayerRequestList();

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] overflow-x-hidden bg-background pb-[100px]">
      <PrayerTopBar />
      <PrayerFilterTabs
        tabs={prayerFilterTabs}
        activeTabId={activePrayerFilterTabId}
      />
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
          등록된 기도제목이 없어요.
        </p>
      ) : (
        <main className="flex flex-col gap-stack-md px-margin-main py-stack-md">
          {data.map((item) => (
            <PrayerRequestCard key={item.id} item={item} />
          ))}
        </main>
      )}
      <BottomNav active="기도" />
    </div>
  );
}
