"use client";

import { useState } from "react";
import { GroupTabBar } from "@/components/group/GroupTabBar";
import { BulletinTab } from "@/components/group/BulletinTab";
import { SermonManuscriptTab } from "@/components/group/SermonManuscriptTab";
import { SermonSummaryTab } from "@/components/group/SermonSummaryTab";
import { PraiseSheetsTab } from "@/components/group/PraiseSheetsTab";
import type { GroupTab, GroupTabId, PraiseSheet, SermonSummary } from "@/lib/mock-data";

interface GroupTabsSectionProps {
  tabs: GroupTab[];
  defaultTabId: GroupTabId;
  bulletinImageUrls: string[];
  sermonImageUrls: string[];
  sermonId: string | null;
  sermonSummary: SermonSummary | null;
  sheets: PraiseSheet[];
}

export function GroupTabsSection({
  tabs,
  defaultTabId,
  bulletinImageUrls,
  sermonImageUrls,
  sermonId,
  sermonSummary,
  sheets,
}: GroupTabsSectionProps) {
  const [activeTabId, setActiveTabId] = useState<GroupTabId>(defaultTabId);

  return (
    <>
      <GroupTabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelect={setActiveTabId}
      />
      {activeTabId === "bulletin" && (
        <BulletinTab imageUrls={bulletinImageUrls} />
      )}
      {activeTabId === "manuscript" && (
        <SermonManuscriptTab imageUrls={sermonImageUrls} />
      )}
      {activeTabId === "summary" && (
        <SermonSummaryTab summary={sermonSummary} sermonId={sermonId} />
      )}
      {activeTabId === "praise" && (
        <PraiseSheetsTab sheets={sheets} sermonId={sermonId} />
      )}
    </>
  );
}
