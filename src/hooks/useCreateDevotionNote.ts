"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface CreateDevotionNoteInput {
  devotionId: string;
  content: string;
}

async function createDevotionNote({ devotionId, content }: CreateDevotionNoteInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  const { error } = await supabase.from("devotion_notes").insert({
    devotion_id: devotionId,
    member_id: user.id,
    content: content.trim(),
  });

  if (error) {
    throw new Error(error.message ?? "나눔을 남기지 못했어요.");
  }
}

export function useCreateDevotionNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDevotionNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devotion"] });
    },
  });
}
