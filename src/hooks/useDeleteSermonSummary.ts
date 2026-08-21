"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function deleteSermonSummary(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("sermon_summaries").delete().eq("id", id);

  if (error) {
    throw new Error(error.message ?? "삭제하지 못했어요.");
  }
}

export function useDeleteSermonSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSermonSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermon-summaries"] });
    },
  });
}
