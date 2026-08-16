"use client";

import Image from "next/image";
import Link from "next/link";
import { Cake } from "lucide-react";
import type { BirthdayInfo } from "@/lib/mock-data";

interface BirthdayCardProps {
  birthday: BirthdayInfo;
}

export function BirthdayCard({ birthday }: BirthdayCardProps) {
  return (
    <Link
      href="/calendar"
      className="flex flex-col justify-between rounded-md border border-border bg-card p-4 shadow-[0_4px_20px_-4px_rgba(44,44,44,0.04)] transition-transform duration-200 active:scale-[0.98]"
    >
      <div>
        <div className="mb-3 flex items-center gap-1">
          <Cake className="h-4 w-4 text-primary" fill="currentColor" />
          <span className="text-label-sm font-semibold text-primary">
            생일 축하해요
          </span>
        </div>
        <div className="mb-3 flex -space-x-2">
          {birthday.avatarUrls.map((url, index) => (
            <Image
              key={url}
              src={url}
              alt={birthday.names[index] ?? ""}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border-2 border-card object-cover"
            />
          ))}
        </div>
        <p className="mb-3 line-clamp-2 text-label-sm text-muted-foreground">
          {birthday.names.join(", ")}
        </p>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        className="w-full rounded-md border border-border bg-surface-container-low py-2 text-label-sm text-muted-foreground transition-colors hover:bg-surface-container active:scale-95"
      >
        축하 메시지 보내기
      </button>
    </Link>
  );
}
