"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useMemberList } from "@/hooks/useMemberList";
import { useMemberApproval } from "@/hooks/useMemberApproval";
import { useSetMemberRole } from "@/hooks/useSetMemberRole";
import { useProfile } from "@/hooks/useProfile";
import type { MemberStatus } from "@/lib/supabase/queries/members";

const STATUS_FILTERS: { id: MemberStatus | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pending", label: "대기" },
  { id: "approved", label: "승인" },
  { id: "rejected", label: "거절" },
];

const STATUS_BADGE: Record<MemberStatus, string> = {
  approved: "bg-success-container text-success-container-foreground",
  pending: "bg-warning-container text-warning-container-foreground",
  rejected: "bg-surface-container-highest text-muted-foreground",
};

const STATUS_LABEL: Record<MemberStatus, string> = {
  approved: "승인",
  pending: "대기",
  rejected: "거절",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function MemberListPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useMemberList();
  const { mutate: decideMember, isPending: isDeciding, variables: decidingVars } =
    useMemberApproval();
  const { mutate: setRole, isPending: isSettingRole, variables: settingRoleVars } =
    useSetMemberRole();
  const { data: me } = useProfile();
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">("all");
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const kw = keyword.trim().toLowerCase();

    return data.filter((member) => {
      if (statusFilter !== "all" && member.status !== statusFilter) return false;
      if (!kw) return true;

      return [member.name, member.gyogyo, member.phone]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(kw));
    });
  }, [data, statusFilter, keyword]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-stack-lg">
      <AdminFormTopBar title="멤버 목록" />
      <main className="flex flex-col gap-stack-md px-margin-main pt-stack-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="이름·가교·전화번호 검색"
            className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-body-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          {STATUS_FILTERS.map((filter) => {
            const isActive = filter.id === statusFilter;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                className={
                  isActive
                    ? "rounded-full bg-primary px-4 py-1.5 text-label-sm text-primary-foreground"
                    : "rounded-full border border-outline-variant bg-surface-container-low px-4 py-1.5 text-label-sm text-muted-foreground transition-colors hover:bg-surface-container"
                }
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <p className="text-label-sm text-muted-foreground">
          {filtered.length}명
        </p>

        {filtered.length === 0 ? (
          <p className="rounded-md border border-outline-variant/40 bg-card p-4 text-center text-label-sm text-muted-foreground">
            조건에 맞는 멤버가 없어요.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-outline-variant/40 bg-card shadow-[0px_4px_14px_rgba(44,44,44,0.03)]">
            {filtered.map((member, index) => {
              const isProcessingThis =
                isDeciding && decidingVars?.memberId === member.id;

              return (
                <div
                  key={member.id}
                  className={
                    index === filtered.length - 1
                      ? "flex items-center justify-between gap-3 p-4"
                      : "flex items-center justify-between gap-3 border-b border-outline-variant/30 p-4"
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-highest font-medium text-muted-foreground">
                      {(member.name ?? "?").charAt(0)}
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-body-md font-medium text-foreground">
                        {member.name ?? "이름 없음"}
                        {member.role === "admin" && (
                          <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            관리자
                          </span>
                        )}
                      </p>
                      <p className="text-label-sm text-muted-foreground">
                        {[member.gyogyo, member.phone].filter(Boolean).join(" · ") ||
                          "정보 없음"}
                      </p>
                      <p className="text-label-sm text-muted-foreground">
                        {formatDate(member.createdAt)} 가입
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_BADGE[member.status]}`}
                    >
                      {STATUS_LABEL[member.status]}
                    </span>
                    {member.status === "pending" && (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={isProcessingThis}
                          onClick={() =>
                            decideMember({ memberId: member.id, status: "rejected" })
                          }
                          className="rounded-md bg-surface-container-highest px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface-dim disabled:opacity-50"
                        >
                          거절
                        </button>
                        <button
                          type="button"
                          disabled={isProcessingThis}
                          onClick={() =>
                            decideMember({ memberId: member.id, status: "approved" })
                          }
                          className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                          승인
                        </button>
                      </div>
                    )}
                    {member.status === "approved" &&
                      !(member.id === me?.id && member.role === "admin") && (
                      <button
                        type="button"
                        disabled={
                          isSettingRole && settingRoleVars?.memberId === member.id
                        }
                        onClick={() => {
                          const nextRole = member.role === "admin" ? "member" : "admin";
                          const confirmMessage =
                            nextRole === "admin"
                              ? `${member.name ?? "이 멤버"}님을 관리자로 지정할까요?`
                              : `${member.name ?? "이 멤버"}님의 관리자 권한을 해제할까요?`;
                          if (window.confirm(confirmMessage)) {
                            setRole({ memberId: member.id, role: nextRole });
                          }
                        }}
                        className="rounded-md border border-outline-variant px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-surface-container-low disabled:opacity-50"
                      >
                        {member.role === "admin" ? "관리자 해제" : "관리자 지정"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
