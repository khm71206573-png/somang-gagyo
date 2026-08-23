"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface CreatePrayerRequestInput {
  /** "우리 가교" 또는 "나의 기도" */
  scope: string;
  content: string;
  /** 감사기도로 올리는지 */
  isThanksgiving: boolean;
}

/** 감사기도 컬럼이 아직 없는 DB에서 나오는 오류 코드들 */
const MISSING_COLUMN_CODES = ["42703", "PGRST204"];

async function createPrayerRequest({
  scope,
  content,
  isThanksgiving,
}: CreatePrayerRequestInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  const { error } = await supabase.from("prayer_requests").insert({
    member_id: user.id,
    category: scope,
    content: content.trim(),
    is_thanksgiving: isThanksgiving,
  });

  if (error) {
    if (MISSING_COLUMN_CODES.includes(error.code ?? "")) {
      throw new Error(
        "감사기도 기능 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요.",
      );
    }
    throw new Error(error.message ?? "기도제목 등록에 실패했어요.");
  }
}

export function useCreatePrayerRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrayerRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayer-requests"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
