"use client";

import Link from "next/link";
import { Download, CheckCircle2, AlertCircle } from "lucide-react";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import { errorText } from "@/components/admin/adminFormStyles";
import {
  useScrapeGroupMaterials,
  type MaterialResult,
} from "@/hooks/useScrapeGroupMaterials";

function ResultRow({ label, result }: { label: string; result: MaterialResult }) {
  return (
    <li className="flex items-start gap-3 rounded-md border border-outline-variant/40 bg-card p-4">
      {result.saved ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      )}
      <div className="flex flex-col gap-1">
        <p className="text-body-md font-medium text-foreground">{label}</p>
        {result.saved ? (
          <>
            <p className="text-label-sm text-muted-foreground">
              {result.date} · 이미지 {result.imageCount}장
            </p>
            <p className="text-label-sm text-muted-foreground">{result.title}</p>
          </>
        ) : (
          <p className="text-label-sm text-muted-foreground">{result.reason}</p>
        )}
      </div>
    </li>
  );
}

export default function GroupMaterialPage() {
  const { mutate, isPending, data, error } = useScrapeGroupMaterials();
  const savedAny = data && (data.sermon.saved || data.bulletin.saved);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="교제 자료 등록" />
      <main className="flex flex-col gap-stack-md px-margin-main pt-stack-sm">
        <p className="text-body-md leading-relaxed text-muted-foreground">
          교회 홈페이지 게시판에서 가장 최근 <strong className="text-foreground">주보</strong>와{" "}
          <strong className="text-foreground">설교안</strong>을 가져와 교제탭에 바로 반영합니다.
        </p>

        <button
          type="button"
          onClick={() => mutate()}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-md bg-primary py-4 text-body-lg font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60"
        >
          <Download className="h-5 w-5" />
          {isPending ? "가져오는 중..." : "게시판에서 가져오기"}
        </button>

        {error && (
          <p className={errorText}>
            {error instanceof Error ? error.message : "교제 자료를 가져오지 못했어요."}
          </p>
        )}

        {data && (
          <>
            <ul className="flex flex-col gap-2">
              <ResultRow label="주보" result={data.bulletin} />
              <ResultRow label="설교안" result={data.sermon} />
            </ul>
            {savedAny && (
              <Link
                href="/group"
                className="rounded-md border border-outline-variant py-3 text-center text-label-sm font-medium text-foreground transition-colors hover:bg-surface-container-low"
              >
                교제탭에서 확인하기
              </Link>
            )}
          </>
        )}

        <div className="mt-stack-sm flex flex-col gap-2 border-t border-outline-variant/30 pt-stack-md">
          <p className="text-label-sm text-muted-foreground">
            설교 요약·나눔 질문을 직접 채우거나, 가져온 자료를 수정하려면 아래에서 관리하세요.
          </p>
          <div className="flex gap-2">
            <Link
              href="/admin/sermon"
              className="flex-1 rounded-md border border-outline-variant py-3 text-center text-label-sm text-foreground transition-colors hover:bg-surface-container-low"
            >
              설교 관리
            </Link>
            <Link
              href="/admin/bulletin"
              className="flex-1 rounded-md border border-outline-variant py-3 text-center text-label-sm text-foreground transition-colors hover:bg-surface-container-low"
            >
              주보 관리
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
