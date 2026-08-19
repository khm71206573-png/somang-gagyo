"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface UploadSheetMusicInput {
  file: File;
  sermonId: string;
}

async function uploadSheetMusic({ file, sermonId }: UploadSheetMusicInput) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sermonId", sermonId);

  const response = await fetch("/api/admin/sermon-songs", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "악보 업로드에 실패했어요.");
  }

  return response.json();
}

export function useUploadSheetMusic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadSheetMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}
