import Link from "next/link";
import { Hand } from "lucide-react";
import type { PrayerRequest } from "@/lib/mock-data";

interface PrayerCardProps {
  requests: PrayerRequest[];
}

export function PrayerCard({ requests }: PrayerCardProps) {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-[0_4px_20px_-4px_rgba(44,44,44,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-title-lg text-foreground">
          함께 기도해요
        </h3>
        <Link href="/prayer" className="text-label-sm text-primary hover:underline">
          모두 보기
        </Link>
      </div>
      <ul className="space-y-4">
        {requests.map((request) => (
          <li key={`${request.author}-${request.content}`} className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md bg-surface-container-low p-2">
              <Hand className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-body-md text-foreground">
                <span className="mr-1 font-semibold">{request.author}:</span>
                {request.content}
              </p>
              <p className="mt-1 text-label-sm text-primary">
                {request.prayingCount}명 기도 중
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
