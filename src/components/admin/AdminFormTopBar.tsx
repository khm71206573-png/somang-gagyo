"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AdminFormTopBarProps {
  title: string;
  listHref?: string;
}

export function AdminFormTopBar({ title, listHref }: AdminFormTopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex items-center gap-2 bg-background/90 px-margin-main py-stack-md backdrop-blur-sm">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-container-low"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 text-title-lg text-foreground">{title}</h1>
      {listHref && (
        <Link
          href={listHref}
          className="text-label-sm font-medium text-primary"
        >
          목록 보기
        </Link>
      )}
    </header>
  );
}
