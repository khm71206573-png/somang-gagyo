import type { SupabaseClient } from "@supabase/supabase-js";

export type MemberStatus = "pending" | "approved" | "rejected";

export interface MemberListItem {
  id: string;
  name: string | null;
  gyogyo: string | null;
  phone: string | null;
  role: string;
  status: MemberStatus;
  createdAt: string;
}

/** 관리자 화면에서 볼 전체 멤버 목록. 상태와 무관하게 모두 가져온다. */
export async function fetchMemberList(
  supabase: SupabaseClient,
): Promise<MemberListItem[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, gyogyo, phone, role, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message ?? "멤버 목록을 불러오지 못했어요.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    gyogyo: row.gyogyo,
    phone: row.phone,
    role: row.role,
    status: row.status as MemberStatus,
    createdAt: row.created_at,
  }));
}
