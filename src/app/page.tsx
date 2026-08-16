"use client";

import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { DevotionCard } from "@/components/dashboard/DevotionCard";
import { BibleReadingCard } from "@/components/dashboard/BibleReadingCard";
import { SongCard } from "@/components/dashboard/SongCard";
import { BirthdayCard } from "@/components/dashboard/BirthdayCard";
import { PrayerCard } from "@/components/dashboard/PrayerCard";
import { EventCard } from "@/components/dashboard/EventCard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { BottomNav } from "@/components/layout/BottomNav";
import { ErrorState } from "@/components/common/ErrorState";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Home() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
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

  const {
    greeting,
    streak,
    devotion,
    bibleReading,
    song,
    birthday,
    prayerRequests,
    upcomingEvents,
  } = data;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[100px]">
      <GreetingHeader greeting={greeting} />
      <main className="space-y-stack-lg px-margin-main pt-stack-sm">
        <StreakBadge streak={streak} />
        {devotion && <DevotionCard devotion={devotion} />}
        {bibleReading && <BibleReadingCard reading={bibleReading} />}
        {(song || birthday) && (
          <section className="grid grid-cols-2 gap-gutter-card">
            {song && <SongCard song={song} />}
            {birthday && <BirthdayCard birthday={birthday} />}
          </section>
        )}
        {prayerRequests.length > 0 && (
          <PrayerCard requests={prayerRequests} />
        )}
        {upcomingEvents.length > 0 && (
          <EventCard events={upcomingEvents} />
        )}
      </main>
      <BottomNav />
    </div>
  );
}
