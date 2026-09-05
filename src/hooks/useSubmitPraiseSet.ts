"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { storageObjectPath } from "@/lib/storage/fileName";
import {
  PRAISE_SET_BUCKET,
  PRAISE_SET_SETUP_MESSAGE,
  PRAISE_SET_YOUTUBE_SETUP_MESSAGE,
  parseYoutubeLink,
} from "@/lib/supabase/queries/praiseSet";
import { upcomingSundayDateString } from "@/lib/supabase/queries/utils";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** 42P01 = 테이블 없음 */
const UNDEFINED_TABLE = "42P01";

/** 42703·PGRST204 = 컬럼 없음. youtube_url 마이그레이션 적용 전이면 이 코드로 온다. */
const MISSING_COLUMN_CODES = ["42703", "PGRST204"];

export const YOUTUBE_LINK_ERROR =
  "유튜브 링크를 확인해주세요. 영상 주소와 재생목록 주소 모두 등록할 수 있어요.";

export interface SubmitPraiseSetInput {
  /** 등록 버튼을 누르기 전에 골라둔 악보 사진들 */
  files: File[];
  /** 함께 등록할 유튜브 링크. 비워두면 사진만 올린다. */
  youtubeUrl: string;
}

export interface SubmitPraiseSetProgress {
  done: number;
  total: number;
}

/** 고른 사진이 올릴 수 있는 파일인지 확인한다. 문제가 없으면 null. */
export function validatePraiseSetImage(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "이미지 파일만 올릴 수 있어요.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `사진 용량은 10MB 이하로 올려주세요. (${file.name})`;
  }
  return null;
}

/**
 * 찬양콘티는 승인된 교인이면 누구나 올릴 수 있다.
 * 악보 사진과 유튜브 링크를 한 번에 받아 "등록하기" 한 번으로 저장한다.
 */
async function submitPraiseSet(
  { files, youtubeUrl }: SubmitPraiseSetInput,
  onProgress: (progress: SubmitPraiseSetProgress | null) => void,
) {
  const trimmedLink = youtubeUrl.trim();
  const link = trimmedLink ? parseYoutubeLink(trimmedLink) : null;

  // 사진을 올리다 링크에서 막히지 않도록 검사를 모두 먼저 끝낸다.
  if (trimmedLink && !link) {
    throw new Error(YOUTUBE_LINK_ERROR);
  }

  if (files.length === 0 && !link) {
    throw new Error("악보 사진이나 유튜브 링크를 추가해주세요.");
  }

  for (const file of files) {
    const message = validatePraiseSetImage(file);
    if (message) throw new Error(message);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  // 콘티는 주일 전(보통 금요일)에 올라오므로 다가오는 주일 날짜로 저장한다.
  const sunday = upcomingSundayDateString();
  const total = files.length + (link ? 1 : 0);
  let done = 0;
  onProgress({ done, total });

  for (const file of files) {
    // 스토리지 정책이 첫 번째 폴더를 올린 사람의 uid로 확인한다.
    const path = storageObjectPath(user.id, file);

    const { error: uploadError } = await supabase.storage
      .from(PRAISE_SET_BUCKET)
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      // 버킷이 아직 만들어지지 않았으면 "Bucket not found"가 돌아온다.
      if (/bucket not found/i.test(uploadError.message ?? "")) {
        throw new Error(PRAISE_SET_SETUP_MESSAGE);
      }
      throw new Error(uploadError.message ?? "사진을 올리지 못했어요.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PRAISE_SET_BUCKET).getPublicUrl(path);

    const { error: insertError } = await supabase.from("praise_sets").insert({
      week_start: sunday,
      image_url: publicUrl,
      storage_path: path,
      created_by: user.id,
    });

    if (insertError) {
      // 목록에 안 뜨는 파일이 스토리지에 남지 않도록 되돌린다.
      await supabase.storage.from(PRAISE_SET_BUCKET).remove([path]);

      const code = insertError.code ?? "";
      if (code === UNDEFINED_TABLE || MISSING_COLUMN_CODES.includes(code)) {
        throw new Error(PRAISE_SET_SETUP_MESSAGE);
      }
      throw new Error(insertError.message ?? "찬양콘티를 등록하지 못했어요.");
    }

    done += 1;
    onProgress({ done, total });
  }

  if (link) {
    const { error } = await supabase.from("praise_sets").insert({
      week_start: sunday,
      // 어디서 복사해 왔든 항상 열리는 형태로 저장한다.
      youtube_url: link.url,
      created_by: user.id,
    });

    if (error) {
      const code = error.code ?? "";
      // 사진은 되는데 링크만 막히면 youtube_url 컬럼이 없는 것이라 따로 안내한다.
      if (MISSING_COLUMN_CODES.includes(code)) {
        throw new Error(PRAISE_SET_YOUTUBE_SETUP_MESSAGE);
      }
      if (code === UNDEFINED_TABLE) {
        throw new Error(PRAISE_SET_SETUP_MESSAGE);
      }
      throw new Error(error.message ?? "링크를 등록하지 못했어요.");
    }

    done += 1;
    onProgress({ done, total });
  }
}

export function useSubmitPraiseSet() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<SubmitPraiseSetProgress | null>(null);

  const handleProgress = useCallback((next: SubmitPraiseSetProgress | null) => {
    setProgress(next);
  }, []);

  const mutation = useMutation({
    mutationFn: (input: SubmitPraiseSetInput) => submitPraiseSet(input, handleProgress),
    // 도중에 실패해도 그 전까지 올라간 콘티는 저장돼 있어서 목록을 다시 읽는다.
    onSettled: () => {
      setProgress(null);
      queryClient.invalidateQueries({ queryKey: ["praise-set"] });
    },
  });

  return { ...mutation, progress };
}
