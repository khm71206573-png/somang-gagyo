"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import {
  AnnouncementForm,
  type AnnouncementFormInitialValue,
} from "@/components/admin/AnnouncementForm";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useAnnouncementAdmin } from "@/hooks/useAnnouncementAdmin";
import { useUpdateAnnouncement } from "@/hooks/useUpdateAnnouncement";

export default function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAnnouncementAdmin(id);
  const { mutateAsync, isPending } = useUpdateAnnouncement();

  const initialValue = useMemo<AnnouncementFormInitialValue | undefined>(() => {
    if (!data) return undefined;

    return {
      kind: data.kind,
      pollType: data.poll_type,
      title: data.title,
      content: data.content,
      isPinned: data.is_pinned,
      allowMultiple: data.allow_multiple,
      hideVoters: data.hide_voters,
      closesAt: data.closes_at,
      options: [...data.announcement_poll_options]
        .sort((a, b) => a.display_order - b.display_order)
        .map((option) => ({
          id: option.id,
          label: option.label ?? "",
          optionDate: option.option_date ?? "",
          // "14:00:00"을 <input type="time">이 받는 "14:00"으로 줄인다.
          startTime: option.start_time?.slice(0, 5) ?? "",
        })),
    };
  }, [data]);

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
      <AdminFormTopBar title="공지 수정" listHref="/admin/announcement" />
      <main className="px-margin-main pt-stack-sm">
        <AnnouncementForm
          initialValue={initialValue}
          submitLabel="수정 저장하기"
          pendingLabel="저장 중..."
          isPending={isPending}
          onSubmit={async (value) => {
            await mutateAsync({ id, ...value });
            router.push("/admin/announcement");
          }}
        />
      </main>
    </div>
  );
}
