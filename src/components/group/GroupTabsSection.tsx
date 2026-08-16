"use client";

import { useState } from "react";
import { GroupTabBar } from "@/components/group/GroupTabBar";
import { SermonSummaryTab } from "@/components/group/SermonSummaryTab";
import { SharingQuestionsTab } from "@/components/group/SharingQuestionsTab";
import { PraiseSheetsTab } from "@/components/group/PraiseSheetsTab";
import type {
  GroupTab,
  GroupTabId,
  SermonSummary,
  SharingQuestion,
  PraiseSheet,
} from "@/lib/mock-data";

interface GroupTabsSectionProps {
  tabs: GroupTab[];
  defaultTabId: GroupTabId;
  summary: SermonSummary;
  questions: SharingQuestion[];
  sheets: PraiseSheet[];
}

export function GroupTabsSection({
  tabs,
  defaultTabId,
  summary,
  questions,
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
      {activeTabId === "summary" && <SermonSummaryTab summary={summary} />}
      {activeTabId === "questions" && (
        <SharingQuestionsTab questions={questions} />
      )}
      {activeTabId === "praise" && <PraiseSheetsTab sheets={sheets} />}
    </>
  );
}
