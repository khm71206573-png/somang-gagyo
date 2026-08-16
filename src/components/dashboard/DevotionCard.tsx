import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import type { DevotionInfo } from "@/lib/mock-data";

interface DevotionCardProps {
  devotion: DevotionInfo;
}

export function DevotionCard({ devotion }: DevotionCardProps) {
  return (
    <Link
      href="/devotion"
      className="relative block cursor-pointer overflow-hidden rounded-md border border-border bg-card p-5 shadow-[0_4px_20px_-4px_rgba(44,44,44,0.04)] transition-transform duration-200 active:scale-[0.98]"
    >
      <div className="mb-3 flex items-start justify-between">
        <span className="rounded-sm bg-primary/10 px-2 py-1 text-label-sm text-primary">
          {devotion.tag}
        </span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="mb-2 font-heading text-title-lg text-foreground">
        {devotion.reference}
      </h2>
      <p className="line-clamp-2 text-body-md text-muted-foreground">
        {devotion.verse}
      </p>
      <div className="pointer-events-none absolute -bottom-4 -right-4 text-primary opacity-5">
        <BookOpen className="h-36 w-36" strokeWidth={1} />
      </div>
    </Link>
  );
}
