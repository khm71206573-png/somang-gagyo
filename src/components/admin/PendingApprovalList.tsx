"use client";

import type { PendingMember } from "@/lib/mock-data";
import { useMemberApproval } from "@/hooks/useMemberApproval";

interface PendingApprovalListProps {
  members: PendingMember[];
}

function PendingMemberRow({
  member,
  isLast,
}: {
  member: PendingMember;
  isLast: boolean;
}) {
  const { mutate, isPending, variables } = useMemberApproval();

  const pendingAction = isPending ? variables?.status : null;

  return (
    <div
      className={
        isLast
          ? "flex items-center justify-between p-4"
          : "flex items-center justify-between border-b border-outline-variant/30 p-4"
      }
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-highest font-medium text-muted-foreground">
          {member.name.charAt(0)}
        </div>
        <div>
          <p className="text-body-md font-medium text-foreground">
            {member.name}
            {member.groupName && (
              <span className="ml-1.5 text-label-sm font-normal text-muted-foreground">
                · {member.groupName}
              </span>
            )}
          </p>
          {member.phone && (
            <p className="text-label-sm text-muted-foreground">{member.phone}</p>
          )}
          <p className="text-label-sm text-muted-foreground">
            {member.appliedLabel}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => mutate({ memberId: member.id, status: "rejected" })}
          className="rounded-md bg-surface-container-highest px-3 py-1.5 text-label-sm font-medium text-muted-foreground transition-colors hover:bg-surface-dim disabled:opacity-50"
        >
          {pendingAction === "rejected" ? "처리 중..." : "거절"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => mutate({ memberId: member.id, status: "approved" })}
          className="rounded-md bg-primary px-3 py-1.5 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pendingAction === "approved" ? "처리 중..." : "승인"}
        </button>
      </div>
    </div>
  );
}

export function PendingApprovalList({ members }: PendingApprovalListProps) {
  return (
    <section
      id="pending-approval"
      className="flex scroll-mt-20 flex-col gap-stack-sm"
    >
      <div className="flex items-end justify-between">
        <h2 className="text-title-lg text-foreground">승인 대기 중인 교인</h2>
        <span className="text-label-sm font-medium text-primary">
          {members.length}명
        </span>
      </div>
      {members.length === 0 ? (
        <p className="rounded-md border border-outline-variant/40 bg-card p-4 text-center text-label-sm text-muted-foreground">
          승인 대기 중인 교인이 없어요.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-outline-variant/40 bg-card shadow-[0px_4px_14px_rgba(44,44,44,0.03)]">
          {members.map((member, index) => (
            <PendingMemberRow
              key={member.id}
              member={member}
              isLast={index === members.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}
