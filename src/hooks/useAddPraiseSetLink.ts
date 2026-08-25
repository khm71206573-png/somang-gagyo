"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  PRAISE_SET_SETUP_MESSAGE,
  youtubeVideoId,
} from "@/lib/supabase/queries/praiseSet";
import { weekStartDateString } from "@/lib/supabase/queries/utils";

/** 42703·PGRST204 = 컬럼 없음. youtube_url 마이그레이션 적용 전이면 이 코드로 온다. */
const MISSING_COLUMN_CODES = ["42703", "PGRST204"];

/** 찬양콘티 유튜브 링크도 승인된 교인이면 누구나 올릴 수 있다. */
async function addPraiseSetLink(url: string) {
  const trimmed = url.trim();
  if (!youtubeVideoId(trimmed)) {
    throw new Error("유튜브 링크를 확인해주세요.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  const { error } = await supabase.from("praise_sets").insert({
    week_start: weekStartDateString(),
    youtube_url: trimmed,
    created_by: user.id,
  });

  if (error) {
    if (error.code === "42P01" || MISSING_COLUMN_CODES.includes(error.code ?? "")) {
      throw new Error(PRAISE_SET_SETUP_MESSAGE);
    }
    throw new Error(error.message ?? "링크를 등록하지 못했어요.");
  }
}

export function useAddPraiseSetLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPraiseSetLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["praise-set"] });
    },
  });
}
