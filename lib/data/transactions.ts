import { attachRelations } from "@/lib/data/relations";
import type { FundDatabase } from "@/lib/storage/types";
import type { MonthSummary, TransactionWithRelations } from "@/lib/types";
import {
  getCurrentYearMonth,
  getMonthStartEnd,
  todayISO,
} from "@/lib/utils/dates";

export function getTransactions(
  db: FundDatabase,
  filters?: {
    startDate?: string;
    endDate?: string;
    tagIds?: number[];
    search?: string;
  }
): TransactionWithRelations[] {
  let rows = db.transactions.filter((t) => {
    if (filters?.startDate && t.date < filters.startDate) return false;
    if (filters?.endDate && t.date > filters.endDate) return false;
    if (
      filters?.tagIds &&
      filters.tagIds.length > 0 &&
      (!t.tagId || !filters.tagIds.includes(t.tagId))
    ) {
      return false;
    }
    return true;
  });

  rows = [...rows].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const mapped = rows.map((row) => attachRelations(db, row));

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    return mapped.filter(
      (r) =>
        r.description?.toLowerCase().includes(q) ||
        r.quickAdd?.label.toLowerCase().includes(q) ||
        r.tag?.name.toLowerCase().includes(q)
    );
  }

  return mapped;
}

export function getTransaction(
  db: FundDatabase,
  id: number
): TransactionWithRelations | null {
  const row = db.transactions.find((t) => t.id === id);
  if (!row) return null;
  return attachRelations(db, row);
}

export function getMonthSummary(
  db: FundDatabase,
  yearMonth?: string
): MonthSummary {
  const ym = yearMonth ?? getCurrentYearMonth();
  const { start, end } = getMonthStartEnd(ym);

  let income = 0;
  let expense = 0;

  for (const t of db.transactions) {
    if (t.date < start || t.date > end) continue;
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }

  return { income, expense, net: income - expense };
}

export function getRecentTransactions(
  db: FundDatabase,
  limit = 8
): TransactionWithRelations[] {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const start = weekStart.toISOString().slice(0, 10);

  return getTransactions(db, { startDate: start }).slice(0, limit);
}

export function createTransaction(
  db: FundDatabase,
  data: {
    type: "income" | "expense";
    amount: number;
    tagId: number | null;
    description?: string | null;
    quickAddId?: number | null;
    date?: string;
  }
): FundDatabase {
  const now = new Date().toISOString();
  const transaction = {
    id: db.nextTransactionId,
    type: data.type,
    amount: data.amount,
    tagId: data.tagId,
    description: data.description ?? null,
    quickAddId: data.quickAddId ?? null,
    date: data.date ?? todayISO(),
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...db,
    transactions: [...db.transactions, transaction],
    nextTransactionId: db.nextTransactionId + 1,
  };
}

export function updateTransaction(
  db: FundDatabase,
  id: number,
  data: {
    type?: "income" | "expense";
    amount?: number;
    tagId?: number | null;
    description?: string | null;
    date?: string;
  }
): FundDatabase {
  const now = new Date().toISOString();

  return {
    ...db,
    transactions: db.transactions.map((t) => {
      if (t.id !== id) return t;
      return {
        ...t,
        type: data.type ?? t.type,
        amount: data.amount ?? t.amount,
        tagId: data.tagId !== undefined ? data.tagId : t.tagId,
        description:
          data.description !== undefined ? data.description : t.description,
        date: data.date ?? t.date,
        updatedAt: now,
      };
    }),
  };
}

export function deleteTransaction(db: FundDatabase, id: number): FundDatabase {
  return {
    ...db,
    transactions: db.transactions.filter((t) => t.id !== id),
  };
}
