"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export type MemberDecision = "approved" | "rejected";

interface DecideMemberInput {
  memberId: string;
  status: MemberDecision;
}

async function decideMember({ memberId, status }: DecideMemberInput) {
  const response = await fetch(`/api/admin/members/${memberId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "처리에 실패했어요.");
  }

  return response.json();
}

export function useMemberApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: decideMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
