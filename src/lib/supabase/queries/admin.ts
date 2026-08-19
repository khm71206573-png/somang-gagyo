import type { SupabaseClient } from "@supabase/supabase-js";
import type { PendingMember } from "@/lib/mock-data";
import { isSameDate, toDateString } from "./utils";

export interface AdminRegistrationStatus {
  devotion: boolean;
  song: boolean;
  sermon: boolean;
}

export interface AdminPageData {
  registrationStatus: AdminRegistrationStatus;
  pendingMembers: PendingMember[];
}

function formatAppliedLabel(date: Date) {
  const now = new Date();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  if (isSameDate(date, now)) return `오늘 ${hh}:${mm} 신청`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDate(date, yesterday)) return `어제 ${hh}:${mm} 신청`;

  return `${date.getMonth() + 1}월 ${date.getDate()}일 신청`;
}

export async function fetchAdminPageData(
  supabase: SupabaseClient,
): Promise<AdminPageData> {
  const todayStr = toDateString(new Date());

  const [{ data: devotion }, { data: dailySong }, { data: sermon }, { data: pending }] =
    await Promise.all([
      supabase.from("devotions").select("id").eq("devotion_date", todayStr).maybeSingle(),
      supabase.from("daily_songs").select("id").eq("song_date", todayStr).maybeSingle(),
      supabase.from("sermons").select("id").eq("sermon_date", todayStr).maybeSingle(),
      supabase
        .from("profiles")
        .select("id, name, gyogyo, phone, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: true }),
    ]);

  // profiles.status에는 "온보딩 전" 상태가 따로 없어서, 실명/소속 가교를
  // 아직 입력하지 않은(온보딩 미완료) 행은 관리자 승인 목록에서 제외한다.
  const completedProfiles = (pending ?? []).filter((p) => p.name && p.gyogyo);

  return {
    registrationStatus: {
      devotion: Boolean(devotion),
      song: Boolean(dailySong),
      sermon: Boolean(sermon),
    },
    pendingMembers: completedProfiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      groupName: profile.gyogyo ?? "",
      phone: profile.phone ?? "",
      appliedLabel: formatAppliedLabel(new Date(profile.created_at)),
    })),
  };
}
