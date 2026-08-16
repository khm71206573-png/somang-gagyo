import type { PendingMember } from "@/lib/mock-data";

interface PendingApprovalListProps {
  members: PendingMember[];
}

export function PendingApprovalList({ members }: PendingApprovalListProps) {
  return (
    <section id="pending-approval" className="flex scroll-mt-20 flex-col gap-stack-sm">
      <div className="flex items-end justify-between">
        <h2 className="text-title-lg text-foreground">
          승인 대기 중인 교인
        </h2>
        <span className="text-label-sm font-medium text-primary">
          {members.length}명
        </span>
      </div>
      <div className="overflow-hidden rounded-md border border-outline-variant/40 bg-card shadow-[0px_4px_14px_rgba(44,44,44,0.03)]">
        {members.map((member, index) => (
          <div
            key={member.id}
            className={
              index !== members.length - 1
                ? "flex items-center justify-between border-b border-outline-variant/30 p-4"
                : "flex items-center justify-between p-4"
            }
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-highest font-medium text-muted-foreground">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="text-body-md font-medium text-foreground">
                  {member.name}
                </p>
                <p className="text-label-sm text-muted-foreground">
                  {member.appliedLabel}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md bg-surface-container-highest px-3 py-1.5 text-label-sm font-medium text-muted-foreground transition-colors hover:bg-surface-dim"
              >
                거절
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                승인
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
