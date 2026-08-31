import { Hand, Footprints } from "lucide-react";

interface PrayerCardProps {
  prayer: string | null;
  practice: string | null;
}

/** 하나님나라QT의 "구하기"(기도)와 "살기"(한 줄 실천) */
export function PrayerCard({ prayer, practice }: PrayerCardProps) {
  if (!prayer && !practice) return null;

  return (
    <section className="flex flex-col gap-stack-sm">
      {prayer && (
        <div className="flex gap-3 rounded-lg bg-surface-container-low p-5">
          <Hand className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="flex flex-col gap-1">
            <h3 className="text-label-sm font-medium text-muted-foreground">
              기도
            </h3>
            <p className="text-body-md leading-relaxed text-foreground">
              {prayer}
            </p>
          </div>
        </div>
      )}

      {practice && (
        <div className="flex gap-3 rounded-lg bg-success-container p-5">
          <Footprints className="mt-0.5 h-5 w-5 shrink-0 text-success-container-foreground" />
          <div className="flex flex-col gap-1">
            <h3 className="text-label-sm font-medium text-success-container-foreground/70">
              오늘 살기
            </h3>
            <p className="text-body-md font-medium leading-relaxed text-success-container-foreground">
              {practice}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
