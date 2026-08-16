import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface PlanSelectorChipProps {
  label: string;
}

export function PlanSelectorChip({ label }: PlanSelectorChipProps) {
  return (
    <Link
      href="/bible-plan-select"
      className="inline-flex items-center gap-1 rounded-full border border-surface-dim bg-surface-container-low px-4 py-2 text-label-sm text-foreground transition-transform active:scale-95"
    >
      {label}
      <ChevronDown className="h-4 w-4" />
    </Link>
  );
}
