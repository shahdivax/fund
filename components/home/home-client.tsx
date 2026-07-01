"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthSummaryBar } from "@/components/home/month-summary";
import { QuickAddGrid } from "@/components/home/quick-add-grid";
import { RecentLog } from "@/components/home/recent-log";
import { TransactionForm } from "@/components/transactions/transaction-form";
import type { QuickAdd, Tag, TransactionWithRelations, MonthSummary } from "@/lib/types";

type HomeClientProps = {
  summary: MonthSummary;
  quickAdds: QuickAdd[];
  recent: TransactionWithRelations[];
  tags: Tag[];
};

export function HomeClient({
  summary,
  quickAdds,
  recent,
  tags,
}: HomeClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedQuickAdd, setSelectedQuickAdd] = useState<QuickAdd | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionWithRelations | null>(null);
  const [mode, setMode] = useState<"create" | "edit" | "quick-add">("create");

  const openCustom = () => {
    setSelectedQuickAdd(null);
    setEditingTransaction(null);
    setMode("create");
    setSheetOpen(true);
  };

  const openQuickAdd = (qa: QuickAdd) => {
    setSelectedQuickAdd(qa);
    setEditingTransaction(null);
    setMode("quick-add");
    setSheetOpen(true);
  };

  const openEdit = (t: TransactionWithRelations) => {
    setEditingTransaction(t);
    setSelectedQuickAdd(null);
    setMode("edit");
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSelectedQuickAdd(null);
    setEditingTransaction(null);
  };

  return (
    <div className="flex flex-1 flex-col">
      <MonthSummaryBar summary={summary} />

      <section className="py-4">
        <h2 className="mb-3 px-4 text-xs text-muted">Quick add</h2>
        <QuickAddGrid quickAdds={quickAdds} onSelect={openQuickAdd} />
        <div className="mt-3 px-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={openCustom}
          >
            <Plus size={16} className="mr-2" aria-hidden />
            Custom
          </Button>
        </div>
      </section>

      <section className="flex-1 border-t border-border">
        <h2 className="px-4 py-3 text-xs text-muted">This week</h2>
        <RecentLog transactions={recent} onSelect={openEdit} />
      </section>

      <TransactionForm
        open={sheetOpen}
        onClose={closeSheet}
        tags={tags}
        quickAdd={selectedQuickAdd}
        transaction={editingTransaction}
        mode={mode}
      />
    </div>
  );
}
