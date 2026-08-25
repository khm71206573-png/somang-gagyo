"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AnnouncementKind,
  AnnouncementPollType,
} from "@/lib/supabase/queries/announcement";

export interface AnnouncementOptionInput {
  /** 기존 항목을 수정할 때만 채워진다. 없으면 새로 추가하는 항목. */
  id?: string;
  /** 문항투표는 문항 내용, 일정투표는 "예배 후" 같은 메모(선택) */
  label: string;
  optionDate: string;
  startTime: string;
}

export interface CreateAnnouncementInput {
  kind: AnnouncementKind;
  pollType: AnnouncementPollType;
  title: string;
  content: string;
  isPinned: boolean;
  allowMultiple: boolean;
  /** ISO 문자열. 마감 없음이면 null */
  closesAt: string | null;
  options: AnnouncementOptionInput[];
}

async function createAnnouncement(input: CreateAnnouncementInput) {
  const response = await fetch("/api/admin/announcements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "공지 등록에 실패했어요.");
  }

  return response.json();
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
