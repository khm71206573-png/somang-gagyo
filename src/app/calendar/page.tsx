"use client";

import { useState } from "react";
import { CalendarTopBar } from "@/components/calendar/CalendarTopBar";
import { MonthCalendarCard } from "@/components/calendar/MonthCalendarCard";
import { ScheduleList } from "@/components/calendar/ScheduleList";
import { CalendarFab } from "@/components/calendar/CalendarFab";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useCalendarPageData } from "@/hooks/useCalendarPageData";
import { toDateString } from "@/lib/supabase/queries/utils";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()));
  const { data, isLoading, isError, error, refetch, isFetching } =
    useCalendarPageData(selectedDate);

  /** 같은 달 안에서 날짜만 바꾼다. */
  function selectDay(date: number) {
    const current = new Date(`${selectedDate}T00:00:00`);
    setSelectedDate(
      toDateString(new Date(current.getFullYear(), current.getMonth(), date)),
    );
  }

  /** 달을 옮길 때는 해당 달의 1일을 선택한 상태로 둔다. */
  function shiftMonth(delta: number) {
    const current = new Date(`${selectedDate}T00:00:00`);
    setSelectedDate(
      toDateString(new Date(current.getFullYear(), current.getMonth() + delta, 1)),
    );
  }

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
        <MonthCalendarCard
          month={data.calendarMonth}
          onSelectDate={selectDay}
          onPrevMonth={() => shiftMonth(-1)}
          onNextMonth={() => shiftMonth(1)}
        />
        <ScheduleList
          dateLabel={data.selectedDateLabel}
          holidayName={data.selectedHolidayName}
          events={data.scheduleEvents}
        />
      </main>
      <CalendarFab />
      <BottomNav active="교제" />
    </div>
  );
}
