"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  PRAISE_SET_BUCKET,
  PRAISE_SET_SETUP_MESSAGE,
} from "@/lib/supabase/queries/praiseSet";
import { weekStartDateString } from "@/lib/supabase/queries/utils";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** 찬양콘티는 승인된 교인이면 누구나 올릴 수 있다. */
async function uploadPraiseSetImage(file: File) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("이미지 파일만 올릴 수 있어요.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("사진 용량은 10MB 이하로 올려주세요.");
  }

  const safeName = file.name.replace(/[^\w.\-가-힣]/g, "_");
  // 스토리지 정책이 첫 번째 폴더를 올린 사람의 uid로 확인한다.
  const path = `${user.id}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(PRAISE_SET_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    // 버킷이 아직 만들어지지 않았으면 "Bucket not found"가 돌아온다.
    if (/bucket not found/i.test(uploadError.message ?? "")) {
      throw new Error(PRAISE_SET_SETUP_MESSAGE);
    }
    throw new Error(uploadError.message ?? "사진을 올리지 못했어요.");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRAISE_SET_BUCKET).getPublicUrl(path);

  const { error: insertError } = await supabase.from("praise_sets").insert({
    week_start: weekStartDateString(),
    image_url: publicUrl,
    storage_path: path,
    created_by: user.id,
  });

  if (insertError) {
    // 목록에 안 뜨는 파일이 스토리지에 남지 않도록 되돌린다.
    await supabase.storage.from(PRAISE_SET_BUCKET).remove([path]);

    if (insertError.code === "42P01") {
      throw new Error(PRAISE_SET_SETUP_MESSAGE);
    }
    throw new Error(insertError.message ?? "찬양콘티를 등록하지 못했어요.");
  }
}

export function useUploadPraiseSetImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPraiseSetImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["praise-set"] });
    },
  });
}
