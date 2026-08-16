"use client";

import { CalendarTopBar } from "@/components/calendar/CalendarTopBar";
import { MonthCalendarCard } from "@/components/calendar/MonthCalendarCard";
import { ScheduleList } from "@/components/calendar/ScheduleList";
import { CalendarFab } from "@/components/calendar/CalendarFab";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useCalendarPageData } from "@/hooks/useCalendarPageData";

export default function CalendarPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useCalendarPageData();

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
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <CalendarTopBar profileImageUrl={data.profileImageUrl} />
      <main className="flex flex-col gap-stack-lg px-margin-main pb-stack-lg">
        <MonthCalendarCard month={data.calendarMonth} />
        <ScheduleList
          dateLabel={data.selectedDateLabel}
          events={data.scheduleEvents}
        />
      </main>
      <CalendarFab />
      <BottomNav active="교제" />
    </div>
  );
}
