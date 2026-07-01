"use client";

import { AmountDisplay } from "@/components/ui/amount-display";
import { TagSwatch } from "@/components/ui/tag-swatch";
import type { TransactionWithRelations } from "@/lib/types";

function entryLabel(t: TransactionWithRelations): string {
  return t.description || t.quickAdd?.label || t.tag?.name || "Entry";
}

export function RecentLog({
  transactions,
  onSelect,
}: {
  transactions: TransactionWithRelations[];
  onSelect: (t: TransactionWithRelations) => void;
}) {
  if (transactions.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-muted">
        Nothing logged this week yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {transactions.map((t) => (
        <li key={t.id}>
          <button
            type="button"
            onClick={() => onSelect(t)}
            className="focus-ring flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface"
          >
            {t.tag && <TagSwatch color={t.tag.color} />}
            <span className="min-w-0 flex-1 truncate text-sm">
              {entryLabel(t)}
            </span>
            <AmountDisplay
              amount={t.amount}
              type={t.type}
              className="shrink-0 text-sm"
            />
          </button>
        </li>
      ))}
    </ul>
  );
}
