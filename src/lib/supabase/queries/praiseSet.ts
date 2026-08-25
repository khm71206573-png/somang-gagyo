import type { SupabaseClient } from "@supabase/supabase-js";
import { formatTimeAgo, unwrapRelation, weekStartDateString } from "./utils";

/** 42P01 = 테이블 없음. 찬양콘티 마이그레이션 적용 전이면 이 코드로 온다. */
const UNDEFINED_TABLE = "42P01";

export const PRAISE_SET_SETUP_MESSAGE =
  "찬양콘티 기능 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요.";

export const PRAISE_SET_BUCKET = "praise-sets";

export interface PraiseSetImage {
  id: string;
  imageUrl: string;
  storagePath: string;
  uploaderName: string;
  timeAgo: string;
  /** 로그인한 사용자가 올린 사진인지 (삭제 버튼 노출용) */
  isMine: boolean;
}

export interface PraiseSetWeek {
  /** 보여주고 있는 콘티의 주 시작일(주일). 올라온 콘티가 없으면 이번 주. */
  weekStart: string;
  /** "8월 24일 ~ 8월 30일" */
  weekLabel: string;
  /** 이번 주 콘티인지. false면 지난 주 콘티를 대신 보여주는 중이다. */
  isThisWeek: boolean;
  images: PraiseSetImage[];
}

/** "2026-08-24" → "8월 24일 ~ 8월 30일" */
export function formatWeekRangeLabel(weekStart: string) {
  const [year, month, day] = weekStart.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 6);
  return `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${end.getMonth() + 1}월 ${end.getDate()}일`;
}

export async function fetchCurrentPraiseSet(
  supabase: SupabaseClient,
): Promise<PraiseSetWeek> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const thisWeekStart = weekStartDateString();

  // 이번 주 콘티가 아직 안 올라온 날에도 화면이 비어 보이지 않도록,
  // 가장 최근에 올라온 주의 콘티를 대신 보여준다. (추천 찬양과 같은 방식)
  const { data: latest, error } = await supabase
    .from("praise_sets")
    .select("week_start")
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === UNDEFINED_TABLE) throw new Error(PRAISE_SET_SETUP_MESSAGE);
    throw new Error(error.message || "찬양콘티를 불러오지 못했어요.");
  }

  const weekStart = (latest?.week_start as string | undefined) ?? thisWeekStart;

  const { data: rows, error: rowsError } = await supabase
    .from("praise_sets")
    .select("id, image_url, storage_path, created_by, created_at, uploader:profiles(name)")
    .eq("week_start", weekStart)
    .order("created_at", { ascending: true });

  if (rowsError) {
    throw new Error(rowsError.message || "찬양콘티를 불러오지 못했어요.");
  }

  return {
    weekStart,
    weekLabel: formatWeekRangeLabel(weekStart),
    isThisWeek: weekStart === thisWeekStart,
    images: (rows ?? []).map((row) => {
      const uploader = unwrapRelation(
        row.uploader as { name: string | null } | { name: string | null }[] | null,
      );

      return {
        id: row.id,
        imageUrl: row.image_url,
        storagePath: row.storage_path,
        uploaderName: uploader?.name ?? "성도",
        timeAgo: formatTimeAgo(row.created_at),
        isMine: Boolean(user) && row.created_by === user?.id,
      };
    }),
  };
}
