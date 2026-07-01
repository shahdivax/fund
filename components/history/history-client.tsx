"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TagSwatch } from "@/components/ui/tag-swatch";
import { AmountDisplay } from "@/components/ui/amount-display";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { formatCurrency, netColorClass } from "@/lib/utils/currency";
import {
  formatDayHeader,
  formatMonthHeader,
  groupTransactionsByMonthAndDay,
} from "@/lib/utils/dates";
import type { Tag, TransactionWithRelations } from "@/lib/types";

function entryLabel(t: TransactionWithRelations): string {
  return t.description || t.quickAdd?.label || t.tag?.name || "Entry";
}

export function HistoryClient({
  transactions,
  tags,
}: {
  transactions: TransactionWithRelations[];
  tags: Tag[];
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [editing, setEditing] = useState<TransactionWithRelations | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filtered = transactions.filter((t) => {
    if (selectedTagIds.length > 0 && (!t.tagId || !selectedTagIds.includes(t.tagId))) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const label = entryLabel(t).toLowerCase();
      if (!label.includes(q) && !t.tag?.name.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const months = groupTransactionsByMonthAndDay(filtered);

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-medium">History</h1>
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="focus-ring flex items-center gap-1.5 rounded-[var(--radius)] px-2 py-1.5 text-xs text-muted hover:text-foreground"
          >
            <SlidersHorizontal size={14} />
            Filters
            {filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {filtersOpen && (
          <div className="mt-3 space-y-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                type="search"
                placeholder="Search descriptions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`focus-ring flex items-center gap-1.5 rounded-[var(--radius)] border px-2.5 py-1.5 text-xs transition-colors duration-150 ${
                    selectedTagIds.includes(tag.id)
                      ? "border-foreground text-foreground"
                      : "border-border text-muted"
                  }`}
                >
                  <TagSwatch color={tag.color} />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {months.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            No entries match your filters.
          </p>
        ) : (
          months.map((month) => (
            <section key={month.yearMonth}>
              <div className="sticky top-0 z-10 flex items-baseline justify-between border-b border-border bg-background px-4 py-2">
                <h2 className="text-xs font-medium">
                  {formatMonthHeader(month.yearMonth)}
                </h2>
                <p className={`tabular-nums text-xs ${netColorClass(month.net)}`}>
                  {formatCurrency(month.net)}
                </p>
              </div>

              {month.days.map((day) => (
                <div key={day.date}>
                  <div className="flex items-baseline justify-between px-4 py-2">
                    <h3 className="text-xs text-muted">
                      {formatDayHeader(day.date)}
                    </h3>
                    <p className={`tabular-nums text-xs ${netColorClass(day.net)}`}>
                      {formatCurrency(day.net)}
                    </p>
                  </div>

                  <ul className="divide-y divide-border border-t border-border">
                    {day.transactions.map((t) => (
                      <li
                        key={t.id}
                        className="group relative"
                        onMouseEnter={() => setHoveredId(t.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(t);
                            setSheetOpen(true);
                          }}
                          className="focus-ring flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface"
                        >
                          {t.tag && <TagSwatch color={t.tag.color} />}
                          <span className="min-w-0 flex-1 truncate text-sm">
                            {entryLabel(t)}
                          </span>
                          <AmountDisplay
                            amount={t.amount}
                            type={t.type}
                            className="w-24 shrink-0 text-right text-sm"
                          />
                        </button>
                        {(hoveredId === t.id) && (
                          <span className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-xs text-muted md:block">
                            Edit
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="flex justify-end gap-4 border-b border-border px-4 py-2 text-xs text-muted">
                <span>
                  In{" "}
                  <span className="tabular-nums text-income">
                    {formatCurrency(month.income)}
                  </span>
                </span>
                <span>
                  Out{" "}
                  <span className="tabular-nums text-expense">
                    {formatCurrency(month.expense)}
                  </span>
                </span>
              </div>
            </section>
          ))
        )}
      </div>

      <TransactionForm
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditing(null);
        }}
        tags={tags}
        transaction={editing}
        mode="edit"
      />
    </div>
  );
}
