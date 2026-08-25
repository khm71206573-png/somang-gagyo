"use client";

import { useRouter } from "next/navigation";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { useCreateAnnouncement } from "@/hooks/useCreateAnnouncement";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateAnnouncement();

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="공지 등록" listHref="/admin/announcement" />
      <main className="px-margin-main pt-stack-sm">
        <AnnouncementForm
          submitLabel="공지 올리기"
          pendingLabel="올리는 중..."
          isPending={isPending}
          onSubmit={async (value) => {
            await mutateAsync(value);
            router.push("/admin/announcement");
          }}
        />
        <p className="mt-stack-md text-center text-label-sm text-muted-foreground">
          공지를 올리면 알림을 켜둔 교인들의 휴대폰으로 알림이 가요.
        </p>
      </main>
    </div>
  );
}
