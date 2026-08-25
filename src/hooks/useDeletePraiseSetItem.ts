"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PRAISE_SET_BUCKET } from "@/lib/supabase/queries/praiseSet";

export interface DeletePraiseSetItemInput {
  id: string;
  /** 사진 콘티일 때만 스토리지 파일이 있다. 유튜브 링크면 null. */
  storagePath: string | null;
}

async function deletePraiseSetItem({ id, storagePath }: DeletePraiseSetItemInput) {
  const supabase = createClient();

  // 행을 먼저 지운다. RLS가 막으면(남의 콘티) 스토리지 파일도 그대로 남는다.
  const { error, count } = await supabase
    .from("praise_sets")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw new Error(error.message ?? "콘티를 삭제하지 못했어요.");
  }

  if (!count) {
    throw new Error("내가 올린 콘티만 지울 수 있어요.");
  }

  if (storagePath) {
    await supabase.storage.from(PRAISE_SET_BUCKET).remove([storagePath]);
  }
}

export function useDeletePraiseSetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePraiseSetItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["praise-set"] });
    },
  });
}
