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
        .from("members")
        .select("id, name, applied_at")
        .eq("status", "pending")
        .order("applied_at", { ascending: true }),
    ]);

  return {
    registrationStatus: {
      devotion: Boolean(devotion),
      song: Boolean(dailySong),
      sermon: Boolean(sermon),
    },
    pendingMembers: (pending ?? []).map((member) => ({
      id: member.id,
      name: member.name,
      appliedLabel: formatAppliedLabel(new Date(member.applied_at)),
    })),
  };
}
