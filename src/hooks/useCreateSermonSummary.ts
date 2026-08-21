"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function createSermonSummary(content: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  const { error } = await supabase.from("sermon_summaries").insert({
    content: content.trim(),
    created_by: user.id,
  });

  if (error) {
    if (error.code === "42P01") {
      throw new Error(
        "설교요약 기능 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요.",
      );
    }
    throw new Error(error.message ?? "등록하지 못했어요.");
  }
}

export function useCreateSermonSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSermonSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermon-summaries"] });
    },
  });
}
