"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  BookMarked,
  Music,
  Hand,
  Users,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
}

const navItems: NavItem[] = [
  { label: "홈", icon: Home, href: "/" },
  { label: "찬양", icon: Music, href: "/song" },
  { label: "묵상", icon: BookOpen, href: "/devotion" },
  { label: "통독", icon: BookMarked, href: "/bible-progress" },
  { label: "기도", icon: Hand, href: "/prayer" },
  { label: "교제", icon: Users, href: "/group" },
  { label: "더보기", icon: MoreHorizontal, href: "/more" },
];

interface BottomNavProps {
  /** 현재 경로가 실제 연결된 탭(홈/묵상/기도)과 일치하지 않을 때 쓰이는 폴백 활성 탭 */
  active?: string;
}

export function BottomNav({ active = "홈" }: BottomNavProps) {
  const pathname = usePathname();
  const matchedByPath = navItems.find((item) => item.href === pathname)?.label;
  const activeLabel = matchedByPath ?? active;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 left-1/2 z-50 flex h-[84px] w-full max-w-[480px] -translate-x-1/2 items-center justify-around bg-background px-1 shadow-[0_-2px_10px_0_rgba(44,44,44,0.04)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navItems.map(({ label, icon: Icon, href }) => {
        const isActive = label === activeLabel;
        // 탭이 7개라 항목 폭을 좁혀야 480px 안에서 잘리지 않는다.
        const className = `flex h-full min-w-0 flex-1 flex-col items-center justify-center text-[11px] transition-transform duration-200 active:scale-90 ${
          isActive ? "font-bold text-primary" : "text-muted-foreground"
        }`;
        const content = (
          <>
            <Icon className="mb-1 h-[22px] w-[22px]" fill={isActive ? "currentColor" : "none"} />
            <span>{label}</span>
          </>
        );

        if (href) {
          return (
            <Link key={label} href={href} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <button key={label} type="button" className={className}>
            {content}
          </button>
        );
      })}
    </nav>
  );
}
