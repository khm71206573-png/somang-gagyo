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
