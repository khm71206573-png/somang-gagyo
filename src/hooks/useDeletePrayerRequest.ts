"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

async function deletePrayerRequest(prayerRequestId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("prayer_requests")
    .delete()
    .eq("id", prayerRequestId);

  if (error) {
    throw new Error(error.message ?? "기도제목을 삭제하지 못했어요.");
  }
}

export function useDeletePrayerRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePrayerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
