"use client";

import { useMemo, useState } from "react";
import { PrayerTopBar } from "@/components/prayer/PrayerTopBar";
import { PrayerFilterTabs } from "@/components/prayer/PrayerFilterTabs";
import { PrayerRequestCard } from "@/components/prayer/PrayerRequestCard";
import { PrayerComposeDialog } from "@/components/prayer/PrayerComposeDialog";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import {
  prayerFilterTabs,
  activePrayerFilterTabId,
  PRAYER_SCOPE_COMMUNITY,
} from "@/lib/mock-data";
import { usePrayerRequestList } from "@/hooks/usePrayerRequestList";

const EMPTY_MESSAGES: Record<string, string> = {
  all: "등록된 기도제목이 없어요.",
  community: "우리 가교에 올라온 기도제목이 없어요.",
  mine: "내가 올린 기도제목이 없어요.",
};

export default function PrayerListPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePrayerRequestList();
  const [activeTabId, setActiveTabId] = useState(activePrayerFilterTabId);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const visibleItems = useMemo(() => {
    if (!data) return [];
    if (activeTabId === "community") {
      return data.filter((item) => item.category === PRAYER_SCOPE_COMMUNITY);
    }
    if (activeTabId === "mine") {
      return data.filter((item) => item.isMine);
    }
    return data;
  }, [data, activeTabId]);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] overflow-x-hidden bg-background pb-[100px]">
      <PrayerTopBar onAddClick={() => setIsComposeOpen(true)} />
      <PrayerFilterTabs
        tabs={prayerFilterTabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
      />
      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : visibleItems.length === 0 ? (
        <p className="px-margin-main py-stack-lg text-center text-body-md text-muted-foreground">
          {EMPTY_MESSAGES[activeTabId] ?? EMPTY_MESSAGES.all}
        </p>
      ) : (
        <main className="flex flex-col gap-stack-md px-margin-main py-stack-md">
          {visibleItems.map((item) => (
            <PrayerRequestCard key={item.id} item={item} />
          ))}
        </main>
      )}
      <PrayerComposeDialog
        open={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
      <BottomNav active="기도" />
    </div>
  );
}
