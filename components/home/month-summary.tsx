import { formatCurrency, netColorClass } from "@/lib/utils/currency";
import type { MonthSummary } from "@/lib/types";

export function MonthSummaryBar({ summary }: { summary: MonthSummary }) {
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <header className="border-b border-border px-4 py-4">
      <p className="mb-2 text-xs text-muted">{monthLabel}</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-muted">Income</p>
          <p className="tabular-nums text-sm text-income">
            {formatCurrency(summary.income)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">Expenses</p>
          <p className="tabular-nums text-sm text-expense">
            {formatCurrency(summary.expense)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Net</p>
          <p className={`tabular-nums text-base ${netColorClass(summary.net)}`}>
            {formatCurrency(summary.net)}
          </p>
        </div>
      </div>
    </header>
  );
}
