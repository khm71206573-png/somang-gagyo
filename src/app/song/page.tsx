"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SongTopBar } from "@/components/song/SongTopBar";
import { SongTabBar } from "@/components/song/SongTabBar";
import { PraiseSetTab } from "@/components/song/PraiseSetTab";
import { RecommendedSongTab } from "@/components/song/RecommendedSongTab";
import { BottomNav } from "@/components/layout/BottomNav";
import { songTabs, activeSongTabId, type SongTabId } from "@/lib/mock-data";

export default function SongPage() {
  return (
    <Suspense fallback={null}>
      <SongTabs />
    </Suspense>
  );
}

function SongTabs() {
  // 홈 찬양 카드에서 "?tab=..."으로 바로 해당 메뉴를 열고 들어온다.
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTabId: SongTabId =
    requestedTab === "praiseSet" || requestedTab === "recommended"
      ? requestedTab
      : activeSongTabId;

  const [activeTabId, setActiveTabId] = useState<SongTabId>(initialTabId);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-24">
      <SongTopBar />
      <SongTabBar
        tabs={songTabs}
        activeTabId={activeTabId}
        onSelect={setActiveTabId}
      />
      <main className="flex flex-col gap-stack-lg px-margin-main pt-stack-md">
        {activeTabId === "praiseSet" ? <PraiseSetTab /> : <RecommendedSongTab />}
      </main>
      <BottomNav active="찬양" />
    </div>
  );
}
