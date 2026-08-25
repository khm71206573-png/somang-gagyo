"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PRAISE_SET_BUCKET } from "@/lib/supabase/queries/praiseSet";

export interface DeletePraiseSetImageInput {
  id: string;
  storagePath: string;
}

async function deletePraiseSetImage({ id, storagePath }: DeletePraiseSetImageInput) {
  const supabase = createClient();

  // 행을 먼저 지운다. RLS가 막으면(남의 사진) 스토리지 파일도 그대로 남는다.
  const { error, count } = await supabase
    .from("praise_sets")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw new Error(error.message ?? "사진을 삭제하지 못했어요.");
  }

  if (!count) {
    throw new Error("내가 올린 사진만 지울 수 있어요.");
  }

  await supabase.storage.from(PRAISE_SET_BUCKET).remove([storagePath]);
}

export function useDeletePraiseSetImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePraiseSetImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["praise-set"] });
    },
  });
}
