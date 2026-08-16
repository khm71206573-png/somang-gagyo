"use client";

import { GroupTopBar } from "@/components/group/GroupTopBar";
import { SermonInfoCard } from "@/components/group/SermonInfoCard";
import { GroupTabsSection } from "@/components/group/GroupTabsSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { groupTabs, activeGroupTabId } from "@/lib/mock-data";
import { useGroupPageData } from "@/hooks/useGroupPageData";

export default function GroupPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGroupPageData();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!data) {
    return <EmptyState message="등록된 설교/모임 정보가 아직 없어요." />;
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[84px]">
      <GroupTopBar title={data.meetingTitle} />
      <main className="mx-auto flex max-w-md flex-col gap-stack-lg px-margin-main pb-stack-lg pt-4">
        <SermonInfoCard sermon={data.sermonInfo} />
        <GroupTabsSection
          tabs={groupTabs}
          defaultTabId={activeGroupTabId}
          summary={data.sermonSummary}
          questions={data.sharingQuestions}
          sheets={data.praiseSheets}
        />
      </main>
      <BottomNav active="교제" />
    </div>
  );
}
