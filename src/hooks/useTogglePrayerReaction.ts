"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface TogglePrayerReactionInput {
  prayerRequestId: string;
  /** 현재 참여 중인지. true면 참여를 취소한다. */
  hasReacted: boolean;
}

async function togglePrayerReaction({
  prayerRequestId,
  hasReacted,
}: TogglePrayerReactionInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  if (hasReacted) {
    const { error } = await supabase
      .from("prayer_reactions")
      .delete()
      .eq("prayer_request_id", prayerRequestId)
      .eq("member_id", user.id);

    if (error) {
      throw new Error(error.message ?? "기도 참여를 취소하지 못했어요.");
    }
    return;
  }

  const { error } = await supabase.from("prayer_reactions").insert({
    prayer_request_id: prayerRequestId,
    member_id: user.id,
  });

  // 이미 참여한 상태(unique 위반)라면 성공으로 본다.
  if (error && error.code !== "23505") {
    throw new Error(error.message ?? "기도 참여에 실패했어요.");
  }
}

export function useTogglePrayerReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePrayerReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
    },
  });
}
