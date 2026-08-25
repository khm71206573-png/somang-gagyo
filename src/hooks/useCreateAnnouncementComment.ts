"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ANNOUNCEMENT_SETUP_MESSAGE } from "@/lib/supabase/queries/announcement";

export interface CreateAnnouncementCommentInput {
  announcementId: string;
  content: string;
}

async function createAnnouncementComment({
  announcementId,
  content,
}: CreateAnnouncementCommentInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  const { error } = await supabase.from("announcement_comments").insert({
    announcement_id: announcementId,
    member_id: user.id,
    content: content.trim(),
  });

  if (error) {
    if (error.code === "42P01") {
      throw new Error(ANNOUNCEMENT_SETUP_MESSAGE);
    }
    throw new Error(error.message || "댓글을 남기지 못했어요.");
  }
}

export function useCreateAnnouncementComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnnouncementComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
