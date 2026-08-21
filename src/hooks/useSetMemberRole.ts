"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export type MemberRole = "member" | "admin";

interface SetMemberRoleInput {
  memberId: string;
  role: MemberRole;
}

async function setMemberRole({ memberId, role }: SetMemberRoleInput) {
  const response = await fetch(`/api/admin/members/${memberId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "처리에 실패했어요.");
  }

  return response.json();
}

export function useSetMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setMemberRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
