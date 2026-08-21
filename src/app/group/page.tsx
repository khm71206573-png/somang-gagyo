"use client";

import { useState } from "react";
import { GroupTopBar } from "@/components/group/GroupTopBar";
import { GroupDatePicker } from "@/components/group/GroupDatePicker";
import { GroupTabsSection } from "@/components/group/GroupTabsSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { groupTabs, activeGroupTabId } from "@/lib/mock-data";
import { useGroupPageData } from "@/hooks/useGroupPageData";
import { toDateString } from "@/lib/supabase/queries/utils";

export default function GroupPage() {
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGroupPageData(selectedDate);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[84px]">
      <GroupTopBar
        title={data?.meetingTitle ?? "가교모임"}
        onCalendarClick={() => setIsDatePickerOpen(true)}
      />
      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <main className="mx-auto flex max-w-md flex-col gap-stack-lg px-margin-main pb-stack-lg pt-4">
          <GroupTabsSection
            tabs={groupTabs}
            defaultTabId={activeGroupTabId}
            bulletinImageUrls={data.bulletinImageUrls}
            sermonImageUrls={data.sermonImageUrls}
            sermonId={data.sermonId}
            sheets={data.praiseSheets}
          />
        </main>
      )}
      <GroupDatePicker
        open={isDatePickerOpen}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        onClose={() => setIsDatePickerOpen(false)}
      />
      <BottomNav active="교제" />
    </div>
  );
}
