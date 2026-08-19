"use client";

import { GroupTopBar } from "@/components/group/GroupTopBar";
import { SermonInfoCard } from "@/components/group/SermonInfoCard";
import { GroupTabsSection } from "@/components/group/GroupTabsSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { groupTabs, activeGroupTabId } from "@/lib/mock-data";
import { useGroupPageData } from "@/hooks/useGroupPageData";

export default function GroupPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGroupPageData();

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
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[84px]">
      <GroupTopBar title={data.meetingTitle} />
      <main className="mx-auto flex max-w-md flex-col gap-stack-lg px-margin-main pb-stack-lg pt-4">
        {data.sermonInfo && <SermonInfoCard sermon={data.sermonInfo} />}
        <GroupTabsSection
          tabs={groupTabs}
          defaultTabId={activeGroupTabId}
          bulletinImageUrls={data.bulletinImageUrls}
          sermonImageUrls={data.sermonImageUrls}
          sermonId={data.sermonId}
          sheets={data.praiseSheets}
        />
      </main>
      <BottomNav active="교제" />
    </div>
  );
}
