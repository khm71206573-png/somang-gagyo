"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Search } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useMemberDirectory } from "@/hooks/useMemberDirectory";
import { avatarFallback } from "@/lib/supabase/queries/utils";

export default function MemberDirectoryPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useMemberDirectory();
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const kw = keyword.trim().toLowerCase();
    if (!kw) return data;

    return data.filter((member) =>
      [member.name, member.gyogyo]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(kw)),
    );
  }, [data, keyword]);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <header className="sticky top-0 z-40 flex items-center gap-2 bg-background/90 px-margin-main py-stack-md backdrop-blur-sm">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-container-low"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-title-lg text-foreground">멤버 목록</h1>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : (
        <main className="flex flex-col gap-stack-md px-margin-main pt-stack-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="이름·가교 검색"
              className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-3 text-body-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <p className="text-label-sm text-muted-foreground">{filtered.length}명</p>

          {filtered.length === 0 ? (
            <p className="rounded-md border border-outline-variant/40 bg-card p-4 text-center text-label-sm text-muted-foreground">
              조건에 맞는 멤버가 없어요.
            </p>
          ) : (
            <div className="overflow-hidden rounded-md border border-outline-variant/40 bg-card shadow-[0px_4px_14px_rgba(44,44,44,0.03)]">
              {filtered.map((member, index) => (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className={
                    index === filtered.length - 1
                      ? "flex items-center gap-3 p-4 transition-colors hover:bg-surface-container-low"
                      : "flex items-center gap-3 border-b border-outline-variant/30 p-4 transition-colors hover:bg-surface-container-low"
                  }
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-surface-container-highest">
                    <Image
                      src={member.avatarUrl ?? avatarFallback(member.name ?? "성도")}
                      alt=""
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="flex items-center gap-1.5 text-body-md font-medium text-foreground">
                      {member.name ?? "이름 없음"}
                      {member.role === "admin" && (
                        <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          관리자
                        </span>
                      )}
                    </p>
                    {member.gyogyo && (
                      <p className="text-label-sm text-muted-foreground">
                        {member.gyogyo}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      )}
      <BottomNav active="더보기" />
    </div>
  );
}
