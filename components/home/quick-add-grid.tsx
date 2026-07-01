"use client";

import { TagSwatch } from "@/components/ui/tag-swatch";
import type { QuickAdd } from "@/lib/types";

export function QuickAddGrid({
  quickAdds,
  onSelect,
}: {
  quickAdds: QuickAdd[];
  onSelect: (qa: QuickAdd) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 px-4">
      {quickAdds.map((qa) => (
        <button
          key={qa.id}
          type="button"
          onClick={() => onSelect(qa)}
          className="focus-ring flex min-h-[52px] items-center gap-2.5 rounded-[var(--radius)] border border-border bg-surface px-3 py-3 text-left text-sm transition-colors duration-150 hover:border-foreground/30"
        >
          {qa.tag && <TagSwatch color={qa.tag.color} />}
          <span className="truncate">{qa.label}</span>
        </button>
      ))}
    </div>
  );
}
