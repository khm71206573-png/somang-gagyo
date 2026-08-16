import type { GroupTab, GroupTabId } from "@/lib/mock-data";

interface GroupTabBarProps {
  tabs: GroupTab[];
  activeTabId: GroupTabId;
  onSelect?: (id: GroupTabId) => void;
}

export function GroupTabBar({ tabs, activeTabId, onSelect }: GroupTabBarProps) {
  return (
    <nav className="relative flex border-b border-outline-variant/30">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect?.(tab.id)}
            className={
              isActive
                ? "relative flex-1 pb-3 text-center text-body-lg font-semibold text-primary"
                : "relative flex-1 pb-3 text-center text-body-lg text-muted-foreground transition-colors hover:text-primary"
            }
          >
            {tab.label}
            {isActive && (
              <div className="absolute -bottom-px left-0 h-[2px] w-full rounded-t-full bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
