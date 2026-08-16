import { Heart } from "lucide-react";

interface SongReasonCardProps {
  reason: string;
}

export function SongReasonCard({ reason }: SongReasonCardProps) {
  const lines = reason.split("\n");

  return (
    <section className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-6 shadow-[0px_-2px_10px_rgba(44,44,44,0.04)]">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <h3 className="text-title-lg text-foreground">이 곡을 고른 이유</h3>
      </div>
      <p className="text-body-md leading-relaxed text-muted-foreground">
        {lines.map((line, index) => (
          <span key={line}>
            {line}
            {index < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    </section>
  );
}
