import type { SupabaseClient } from "@supabase/supabase-js";

export interface DirectoryMember {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  gyogyo: string | null;
  role: string;
}

/** 승인된 멤버 전체를 이름순으로 가져온다. 전 교인이 볼 수 있는 공개 명단이다. */
export async function fetchMemberDirectory(
  supabase: SupabaseClient,
): Promise<DirectoryMember[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, gyogyo, role")
    .eq("status", "approved")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message ?? "멤버 목록을 불러오지 못했어요.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    gyogyo: row.gyogyo,
    role: row.role,
  }));
}

export interface DirectoryMemberProfile extends DirectoryMember {
  status: string;
}

/**
 * 특정 멤버의 프로필을 가져온다. RLS상 승인된 멤버·본인·관리자만 조회할 수
 * 있으므로, 그 외의 경우 null이 돌아온다.
 */
export async function fetchMemberProfileById(
  supabase: SupabaseClient,
  id: string,
): Promise<DirectoryMemberProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, gyogyo, role, status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message ?? "프로필을 불러오지 못했어요.");
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    avatarUrl: data.avatar_url,
    gyogyo: data.gyogyo,
    role: data.role,
    status: data.status,
  };
}
