"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface CreatePrayerRequestInput {
  /** "우리 가교" 또는 "나의 기도" */
  scope: string;
  content: string;
}

async function createPrayerRequest({ scope, content }: CreatePrayerRequestInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  const { error } = await supabase.from("prayer_requests").insert({
    member_id: user.id,
    category: scope,
    content: content.trim(),
  });

  if (error) {
    throw new Error(error.message ?? "기도제목 등록에 실패했어요.");
  }
}

export function useCreatePrayerRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrayerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
