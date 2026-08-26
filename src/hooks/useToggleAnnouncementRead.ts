"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ANNOUNCEMENT_SETUP_MESSAGE } from "@/lib/supabase/queries/announcement";

export interface ToggleAnnouncementReadInput {
  announcementId: string;
  /** 이미 확인 표시를 했는지. true면 표시를 취소한다. */
  hasRead: boolean;
}

async function toggleAnnouncementRead({
  announcementId,
  hasRead,
}: ToggleAnnouncementReadInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  if (hasRead) {
    const { error } = await supabase
      .from("announcement_reads")
      .delete()
      .eq("announcement_id", announcementId)
      .eq("member_id", user.id);

    if (error) {
      throw new Error(error.message || "확인 표시를 취소하지 못했어요.");
    }
    return;
  }

  const { error } = await supabase.from("announcement_reads").insert({
    announcement_id: announcementId,
    member_id: user.id,
  });

  // 이미 확인한 상태(unique 위반)라면 성공으로 본다.
  if (error && error.code !== "23505") {
    if (error.code === "42P01") {
      throw new Error(ANNOUNCEMENT_SETUP_MESSAGE);
    }
    throw new Error(error.message || "확인 표시를 하지 못했어요.");
  }
}

export function useToggleAnnouncementRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleAnnouncementRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
