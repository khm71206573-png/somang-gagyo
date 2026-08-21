"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { useProfile } from "@/hooks/useProfile";
import { avatarFallback } from "@/lib/supabase/queries/utils";

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: profile, isLoading } = useMemberProfile(id);
  const { data: me } = useProfile();

  const isSelf = me?.id === id;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-stack-lg">
      <header className="sticky top-0 z-40 flex items-center gap-2 bg-background/90 px-margin-main py-stack-md backdrop-blur-sm">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-container-low"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-title-lg text-foreground">멤버 프로필</h1>
      </header>

      <main className="flex flex-col gap-stack-md px-margin-main pt-stack-sm">
        {isLoading ? (
          <LoadingState />
        ) : !profile || profile.status !== "approved" ? (
          <p className="py-stack-lg text-center text-body-md text-muted-foreground">
            존재하지 않거나 볼 수 없는 프로필이에요.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-stack-md rounded-lg border border-outline-variant/30 bg-card p-6 shadow-[0px_4px_20px_rgba(44,44,44,0.04)]">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-surface-container-highest">
              <Image
                src={profile.avatarUrl ?? avatarFallback(profile.name ?? "성도")}
                alt="프로필 사진"
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>

            <span
              className={
                profile.role === "admin"
                  ? "rounded-full bg-primary/10 px-3 py-1 text-label-sm font-medium text-primary"
                  : "rounded-full bg-surface-container-highest px-3 py-1 text-label-sm font-medium text-muted-foreground"
              }
            >
              {profile.role === "admin" ? "관리자" : "멤버"}
            </span>

            <div className="text-center">
              <p className="text-title-lg font-semibold text-foreground">
                {profile.name ?? "이름 없음"}
              </p>
              {profile.gyogyo && (
                <p className="mt-1 text-label-sm text-muted-foreground">
                  {profile.gyogyo}
                </p>
              )}
            </div>

            {isSelf && (
              <Link
                href="/profile"
                className="w-full rounded-md border border-primary py-2.5 text-center text-label-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                내 프로필 수정하기
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
