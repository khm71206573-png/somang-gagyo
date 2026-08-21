"use client";

import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { TodayRegistrationStatus } from "@/components/admin/TodayRegistrationStatus";
import { QuickManagementGrid } from "@/components/admin/QuickManagementGrid";
import { PendingApprovalList } from "@/components/admin/PendingApprovalList";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { quickManagementActions } from "@/lib/mock-data";
import type { RegistrationStatusItem } from "@/lib/mock-data";
import { useAdminPageData } from "@/hooks/useAdminPageData";

export default function AdminPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminPageData();

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

  const registrationItems: RegistrationStatusItem[] = [
    {
      id: "devotion",
      label: "묵상",
      icon: "devotion",
      href: "/devotion",
      isRegistered: data.registrationStatus.devotion,
    },
    {
      id: "song",
      label: "찬양",
      icon: "song",
      href: "/song",
      isRegistered: data.registrationStatus.song,
    },
    {
      id: "groupMaterial",
      label: "교제자료",
      icon: "groupMaterial",
      href: "/admin/group-material",
      isRegistered: data.registrationStatus.groupMaterial,
    },
  ];

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background pb-[84px]">
      <AdminTopBar />
      <main className="flex flex-1 flex-col gap-stack-lg px-margin-main py-stack-md">
        <TodayRegistrationStatus items={registrationItems} />
        <QuickManagementGrid actions={quickManagementActions} />
        <PendingApprovalList members={data.pendingMembers} />
      </main>
      <BottomNav active="더보기" />
    </div>
  );
}
