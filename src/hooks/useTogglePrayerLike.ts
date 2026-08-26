"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface TogglePrayerLikeInput {
  prayerRequestId: string;
  /** 이미 하트를 눌렀는지. true면 좋아요를 취소한다. */
  hasLiked: boolean;
}

async function togglePrayerLike({
  prayerRequestId,
  hasLiked,
}: TogglePrayerLikeInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  if (hasLiked) {
    const { error } = await supabase
      .from("prayer_likes")
      .delete()
      .eq("prayer_request_id", prayerRequestId)
      .eq("member_id", user.id);

    if (error) {
      throw new Error(error.message || "좋아요를 취소하지 못했어요.");
    }
    return;
  }

  const { error } = await supabase.from("prayer_likes").insert({
    prayer_request_id: prayerRequestId,
    member_id: user.id,
  });

  // 이미 누른 상태(unique 위반)라면 성공으로 본다.
  if (error && error.code !== "23505") {
    if (error.code === "42P01") {
      throw new Error(
        "좋아요 기능 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요.",
      );
    }
    throw new Error(error.message || "좋아요를 누르지 못했어요.");
  }
}

export function useTogglePrayerLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePrayerLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
    },
  });
}
