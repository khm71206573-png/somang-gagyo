"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Camera, ChevronRight, Users } from "lucide-react";
import { LoadingState } from "@/components/common/LoadingState";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateMyProfile } from "@/hooks/useUpdateMyProfile";
import { avatarFallback } from "@/lib/supabase/queries/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { data, isLoading } = useProfile();
  const { mutate: saveProfile, isPending, error, isSuccess } = useUpdateMyProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setName(data.name ?? "");
  }, [data]);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) setAvatarFile(file);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError("이름을 입력해주세요.");
      return;
    }

    saveProfile(
      { name, avatarFile: avatarFile ?? undefined },
      { onSuccess: () => setAvatarFile(null) },
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!data) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-margin-main text-center">
        <p className="text-body-md text-muted-foreground">
          프로필을 불러오지 못했어요.
        </p>
      </div>
    );
  }

  const displayAvatarUrl = previewUrl ?? data.avatar_url ?? avatarFallback(data.name ?? "성도");
  const errorMessage = localError ?? (error instanceof Error ? error.message : null);

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
        <h1 className="text-title-lg text-foreground">내 프로필</h1>
      </header>

      <main className="flex flex-col gap-stack-lg px-margin-main pt-stack-sm">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-stack-md rounded-lg border border-outline-variant/30 bg-card p-6 shadow-[0px_4px_20px_rgba(44,44,44,0.04)]"
        >
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-surface-container-highest">
              <Image
                src={displayAvatarUrl}
                alt="프로필 사진"
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              aria-label="프로필 사진 바꾸기"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-transform active:scale-90"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <span
            className={
              data.role === "admin"
                ? "rounded-full bg-primary/10 px-3 py-1 text-label-sm font-medium text-primary"
                : "rounded-full bg-surface-container-highest px-3 py-1 text-label-sm font-medium text-muted-foreground"
            }
          >
            {data.role === "admin" ? "관리자" : "멤버"}
          </span>

          <div className="flex w-full flex-col gap-2">
            <label htmlFor="name" className="text-label-sm text-foreground">
              이름 (별명 가능)
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setLocalError(null);
              }}
              placeholder="이름 또는 별명"
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-body-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {(data.gyogyo || data.phone) && (
            <div className="flex w-full flex-col gap-1 text-label-sm text-muted-foreground">
              {data.gyogyo && <p>소속: {data.gyogyo}</p>}
              {data.phone && <p>전화번호: {data.phone}</p>}
            </div>
          )}

          {errorMessage && (
            <p className="w-full text-label-sm text-destructive">{errorMessage}</p>
          )}
          {isSuccess && !errorMessage && (
            <p className="w-full text-label-sm text-muted-foreground">저장했어요.</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-primary py-3 text-body-md font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60"
          >
            {isPending ? "저장하는 중..." : "저장"}
          </button>
        </form>

        <Link
          href="/members"
          className="flex items-center gap-4 rounded-md border border-outline-variant/40 bg-card p-4 shadow-[0px_4px_14px_rgba(44,44,44,0.03)] transition-colors hover:bg-surface-container-low"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-body-md font-medium text-foreground">멤버 목록</p>
            <p className="text-label-sm text-muted-foreground">
              함께하는 멤버들의 프로필을 볼 수 있어요
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      </main>
    </div>
  );
}
