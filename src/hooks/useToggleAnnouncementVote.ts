"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ANNOUNCEMENT_SETUP_MESSAGE } from "@/lib/supabase/queries/announcement";

export interface ToggleAnnouncementVoteInput {
  announcementId: string;
  optionId: string;
  /** 이미 고른 항목인지. true면 선택을 취소한다. */
  isSelected: boolean;
  /** 복수 선택 투표인지. false면 기존 선택을 지우고 새로 고른다. */
  allowMultiple: boolean;
}

async function toggleAnnouncementVote({
  announcementId,
  optionId,
  isSelected,
  allowMultiple,
}: ToggleAnnouncementVoteInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  if (isSelected) {
    const { error } = await supabase
      .from("announcement_poll_votes")
      .delete()
      .eq("option_id", optionId)
      .eq("member_id", user.id);

    if (error) {
      throw new Error(error.message || "선택을 취소하지 못했어요.");
    }
    return;
  }

  // 단일 선택 투표는 기존 선택을 먼저 비운다 (DB 트리거로도 한 번 더 막혀 있다).
  if (!allowMultiple) {
    const { error: clearError } = await supabase
      .from("announcement_poll_votes")
      .delete()
      .eq("announcement_id", announcementId)
      .eq("member_id", user.id);

    if (clearError) {
      throw new Error(clearError.message || "투표하지 못했어요.");
    }
  }

  const { error } = await supabase.from("announcement_poll_votes").insert({
    announcement_id: announcementId,
    option_id: optionId,
    member_id: user.id,
  });

  // 이미 같은 항목을 고른 상태(unique 위반)라면 성공으로 본다.
  if (error && error.code !== "23505") {
    if (error.code === "42P01") {
      throw new Error(ANNOUNCEMENT_SETUP_MESSAGE);
    }
    // 마감된 투표는 RLS가 막아서 행이 하나도 들어가지 않는다.
    if (error.code === "42501") {
      throw new Error("마감된 투표예요.");
    }
    throw new Error(error.message || "투표하지 못했어요.");
  }
}

export function useToggleAnnouncementVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleAnnouncementVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
