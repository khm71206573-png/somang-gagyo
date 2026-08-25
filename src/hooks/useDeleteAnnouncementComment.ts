"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function deleteAnnouncementComment(commentId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("announcement_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error(error.message || "댓글을 삭제하지 못했어요.");
  }
}

export function useDeleteAnnouncementComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnnouncementComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
