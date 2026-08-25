"use client";

import { useState } from "react";
import { SongTopBar } from "@/components/song/SongTopBar";
import { SongTabBar } from "@/components/song/SongTabBar";
import { PraiseSetTab } from "@/components/song/PraiseSetTab";
import { RecommendedSongTab } from "@/components/song/RecommendedSongTab";
import { BottomNav } from "@/components/layout/BottomNav";
import { songTabs, activeSongTabId, type SongTabId } from "@/lib/mock-data";

export default function SongPage() {
  const [activeTabId, setActiveTabId] = useState<SongTabId>(activeSongTabId);

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
