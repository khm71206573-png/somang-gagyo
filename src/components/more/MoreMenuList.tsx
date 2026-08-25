"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  BookMarked,
  Megaphone,
  UserCircle,
  Users,
  ChevronRight,
} from "lucide-react";
import { AdminAccessDialog } from "@/components/more/AdminAccessDialog";
import { useProfile } from "@/hooks/useProfile";
import type { MoreMenuItem, MoreMenuIcon } from "@/lib/mock-data";

interface MoreMenuListProps {
  items: MoreMenuItem[];
}

const iconMap: Record<MoreMenuIcon, typeof ShieldCheck> = {
  admin: ShieldCheck,
  announcement: Megaphone,
  biblePlan: BookMarked,
  profile: UserCircle,
  members: Users,
};

export function MoreMenuList({ items }: MoreMenuListProps) {
  const { data: profile } = useProfile();
  const [isAdminNoticeOpen, setIsAdminNoticeOpen] = useState(false);

  // 프로필을 아직 못 읽었으면 막지 않는다. (그 경우에도 /admin은 미들웨어가 걸러낸다)
  const isBlockedFromAdmin = Boolean(profile) && profile?.role !== "admin";

  return (
    <>
      <nav className="flex flex-col overflow-hidden rounded-md border border-outline-variant/40 bg-card shadow-[0px_4px_14px_rgba(44,44,44,0.03)]">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon];
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={(event) => {
                if (item.adminOnly && isBlockedFromAdmin) {
                  event.preventDefault();
                  setIsAdminNoticeOpen(true);
                }
              }}
              className={
                index !== items.length - 1
                  ? "flex items-center gap-4 border-b border-outline-variant/30 p-4 transition-colors hover:bg-surface-container-low"
                  : "flex items-center gap-4 p-4 transition-colors hover:bg-surface-container-low"
              }
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-body-md font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-label-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          );
        })}
      </nav>

      <AdminAccessDialog
        open={isAdminNoticeOpen}
        onClose={() => setIsAdminNoticeOpen(false)}
      />
    </>
  );
}
