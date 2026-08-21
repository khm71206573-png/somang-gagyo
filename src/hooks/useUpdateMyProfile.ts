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

  const update: { name: string; avatar_url?: string } = { name: name.trim() };

  if (avatarFile) {
    if (!avatarFile.type.startsWith("image/")) {
      throw new Error("이미지 파일만 올릴 수 있어요.");
    }
    if (avatarFile.size > MAX_AVATAR_BYTES) {
      throw new Error("사진 용량은 5MB 이하로 올려주세요.");
    }

    const safeName = avatarFile.name.replace(/[^\w.\-가-힣]/g, "_");
    const path = `${user.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, avatarFile, { contentType: avatarFile.type });

    if (uploadError) {
      throw new Error(uploadError.message ?? "사진을 올리지 못했어요.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

    update.avatar_url = publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message ?? "저장하지 못했어요.");
  }
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
