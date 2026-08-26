"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, List } from "lucide-react";

interface AnnouncementDetailTopBarProps {
  /** 작성자에게만 보여주는 수정 링크 */
  editHref?: string;
}

export function AnnouncementDetailTopBar({ editHref }: AnnouncementDetailTopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex items-center gap-2 bg-background/90 px-margin-main py-stack-md backdrop-blur-sm">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => router.back()}
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-container-low"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 text-title-lg text-foreground">공지사항</h1>
      {/* 홈에서 바로 들어오면 뒤로 가기로는 목록에 닿지 못해서 따로 둔다. */}
      <Link
        href="/announcement"
        aria-label="공지사항 목록"
        className="flex items-center gap-1 rounded-full px-2 py-1 text-label-sm font-medium text-muted-foreground transition-colors hover:bg-surface-container-low"
      >
        <List className="h-4 w-4" />
        목록
      </Link>
      {editHref && (
        <Link href={editHref} className="text-label-sm font-medium text-primary">
          수정
        </Link>
      )}
    </header>
  );
}
