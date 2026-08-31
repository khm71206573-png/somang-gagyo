"use client";

import { useMutation } from "@tanstack/react-query";
import { prepareDevotionPhoto } from "@/lib/devotionPhotoFile";
import { toDateString } from "@/lib/supabase/queries/utils";

export interface OcrDevotionPhotoResult {
  devotionDate: string;
  /** 사진 날짜가 오늘과 많이 다르거나 못 읽었을 때의 안내 문구 */
  warning: string | null;
  title: string;
  reference: string;
  hymn: string;
  verses: string[];
  questions: string[];
  commentary: string;
  prayer: string;
  practice: string;
  footnotes: string;
  imageUrls: string[];
}

async function ocrDevotionPhotos(files: File[]): Promise<OcrDevotionPhotoResult> {
  const formData = new FormData();

  // 업로드 전에 브라우저에서 JPEG로 줄인다 (HEIC·대용량 사진 대비).
  for (const file of files) {
    formData.append("photos", await prepareDevotionPhoto(file));
  }

  // 지면에는 연도가 없어서 서버가 연도를 붙일 기준 날짜를 함께 보낸다.
  formData.append("today", toDateString(new Date()));

  const response = await fetch("/api/admin/devotions/ocr", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "사진을 읽지 못했어요.");
  }

  return response.json();
}

export function useOcrDevotionPhoto() {
  return useMutation({ mutationFn: ocrDevotionPhotos });
}
