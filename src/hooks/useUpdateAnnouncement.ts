"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAnnouncementInput } from "@/hooks/useCreateAnnouncement";

export interface UpdateAnnouncementInput extends CreateAnnouncementInput {
  id: string;
}

async function updateAnnouncement({ id, ...input }: UpdateAnnouncementInput) {
  const response = await fetch(`/api/admin/announcements/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "공지 수정에 실패했어요.");
  }

  return response.json();
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
