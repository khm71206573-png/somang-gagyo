"use client";

import { useQuery } from "@tanstack/react-query";

export interface ProfileData {
  id: string;
  name: string;
  role: string;
  status: string;
}

async function fetchProfile(): Promise<ProfileData | null> {
  const response = await fetch("/api/me");

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export function useProfile() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useIsAdmin() {
  const { data } = useProfile();
  return data?.role === "admin" && data?.status === "approved";
}
