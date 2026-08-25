"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ANNOUNCEMENT_SETUP_MESSAGE } from "@/lib/supabase/queries/announcement";

export interface SubmitAnnouncementVoteInput {
  announcementId: string;
  /** 고른 항목들. 단일 선택 투표면 하나만 담긴다. */
  optionIds: string[];
}

/**
 * 고른 항목을 한 번에 저장한다. (선택 → "투표 완료" 버튼)
 * 이미 투표한 사람이 다시 저장하면 기존 표를 지우고 새 선택으로 바꾼다. (투표 수정)
 */
async function submitAnnouncementVote({
  announcementId,
  optionIds,
}: SubmitAnnouncementVoteInput) {
  if (optionIds.length === 0) {
    throw new Error("항목을 선택해주세요.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  // 마감된 투표는 RLS가 삭제도 막기 때문에 기존 표가 지워지지 않는다.
  const { error: clearError } = await supabase
    .from("announcement_poll_votes")
    .delete()
    .eq("announcement_id", announcementId)
    .eq("member_id", user.id);

  if (clearError) {
    throw new Error(clearError.message || "투표를 저장하지 못했어요.");
  }

  const { error } = await supabase.from("announcement_poll_votes").insert(
    optionIds.map((optionId) => ({
      announcement_id: announcementId,
      option_id: optionId,
      member_id: user.id,
    })),
  );

  if (error) {
    if (error.code === "42P01") {
      throw new Error(ANNOUNCEMENT_SETUP_MESSAGE);
    }
    // 마감된 투표는 RLS가 막아서 행이 하나도 들어가지 않는다.
    if (error.code === "42501") {
      throw new Error("마감된 투표예요.");
    }
    throw new Error(error.message || "투표를 저장하지 못했어요.");
  }
}

export function useSubmitAnnouncementVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAnnouncementVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
