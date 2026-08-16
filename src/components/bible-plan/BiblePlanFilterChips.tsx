import type { BiblePlanFilterChip } from "@/lib/mock-data";

interface BiblePlanFilterChipsProps {
  chips: BiblePlanFilterChip[];
  activeChipId: string;
}

export function BiblePlanFilterChips({
  chips,
  activeChipId,
}: BiblePlanFilterChipsProps) {
  return (
    <div className="mt-stack-md px-margin-main">
      <div className="flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => {
          const isActive = chip.id === activeChipId;
          return (
            <button
              key={chip.id}
              type="button"
              className={
                isActive
                  ? "shrink-0 snap-start rounded-full bg-primary px-4 py-2 text-label-sm text-primary-foreground shadow-[0_2px_8px_rgba(145,71,35,0.2)] transition-transform active:scale-95"
                  : "shrink-0 snap-start rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 text-label-sm text-muted-foreground transition-colors hover:bg-surface-container"
              }
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
