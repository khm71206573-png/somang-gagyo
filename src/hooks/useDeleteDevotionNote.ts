"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function deleteDevotionNote(noteId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("devotion_notes").delete().eq("id", noteId);

  if (error) {
    throw new Error(error.message ?? "나눔을 삭제하지 못했어요.");
  }
}

export function useDeleteDevotionNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDevotionNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotion"] });
    },
  });
}
