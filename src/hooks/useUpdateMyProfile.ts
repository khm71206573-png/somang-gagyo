"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export interface UpdateMyProfileInput {
  name: string;
  /** 새로 고를 사진. 안 바꾸면 undefined. */
  avatarFile?: File;
}

async function updateMyProfile({ name, avatarFile }: UpdateMyProfileInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  if (!name.trim()) {
    throw new Error("이름을 입력해주세요.");
  }

  if (avatarFile) {
    if (!avatarFile.type.startsWith("image/")) {
      throw new Error("이미지 파일만 올릴 수 있어요.");
    }
    if (avatarFile.size > MAX_AVATAR_BYTES) {
      throw new Error("사진 용량은 5MB 이하로 올려주세요.");
    }
  }

  // 사진 업로드가 실패해도 이름은 남도록 이름을 먼저 저장한다.
  const { error: nameError } = await supabase
    .from("profiles")
    .update({ name: name.trim() })
    .eq("id", user.id);

  if (nameError) {
    throw new Error(nameError.message ?? "저장하지 못했어요.");
  }

  if (!avatarFile) return;

  const safeName = avatarFile.name.replace(/[^\w.\-가-힣]/g, "_");
  const path = `${user.id}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, avatarFile, { contentType: avatarFile.type });

  if (uploadError) {
    // avatars 버킷이 아직 만들어지지 않았으면 "Bucket not found"가 돌아온다.
    if (/bucket not found/i.test(uploadError.message ?? "")) {
      throw new Error(
        "프로필 사진 저장소 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요. (이름은 저장했어요)",
      );
    }
    throw new Error(uploadError.message ?? "사진을 올리지 못했어요.");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  const { error: avatarError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (avatarError) {
    throw new Error(avatarError.message ?? "사진을 저장하지 못했어요.");
  }
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    // 사진 업로드가 실패해도 이름은 이미 저장됐을 수 있어서, 성공/실패와
    // 무관하게 화면을 최신 상태로 새로 읽어온다.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
