"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAnalyticsChartData } from "@/lib/data/analytics";
import { exportTransactionsCsv } from "@/lib/data/export";
import {
  createQuickAdd,
  deleteQuickAdd,
  getQuickAdds,
  updateQuickAdd,
} from "@/lib/data/quick-adds";
import {
  createTag,
  deleteTag,
  getTags,
  getTagsWithUsage,
  updateTag,
} from "@/lib/data/tags";
import {
  createTransaction,
  deleteTransaction,
  getMonthSummary,
  getRecentTransactions,
  getTransactions,
  updateTransaction,
} from "@/lib/data/transactions";
import { loadDatabase, saveDatabase } from "@/lib/storage/persist";
import type { FundDatabase } from "@/lib/storage/types";
import type { PeriodMonths } from "@/lib/types";

type FundContextValue = {
  ready: boolean;
  db: FundDatabase;
  getTags: () => ReturnType<typeof getTags>;
  getTagsWithUsage: () => ReturnType<typeof getTagsWithUsage>;
  getQuickAdds: () => ReturnType<typeof getQuickAdds>;
  getTransactions: (
    filters?: Parameters<typeof getTransactions>[1]
  ) => ReturnType<typeof getTransactions>;
  getMonthSummary: (yearMonth?: string) => ReturnType<typeof getMonthSummary>;
  getRecentTransactions: (
    limit?: number
  ) => ReturnType<typeof getRecentTransactions>;
  getAnalyticsChartData: (
    period: PeriodMonths
  ) => ReturnType<typeof getAnalyticsChartData>;
  exportTransactionsCsv: () => string;
  createTransaction: (
    data: Parameters<typeof createTransaction>[1]
  ) => void;
  updateTransaction: (
    id: number,
    data: Parameters<typeof updateTransaction>[2]
  ) => void;
  deleteTransaction: (id: number) => void;
  createTag: (data: Parameters<typeof createTag>[1]) => void;
  updateTag: (
    id: number,
    data: Parameters<typeof updateTag>[2]
  ) => void;
  deleteTag: (id: number) => void;
  createQuickAdd: (data: Parameters<typeof createQuickAdd>[1]) => void;
  updateQuickAdd: (
    id: number,
    data: Parameters<typeof updateQuickAdd>[2]
  ) => void;
  deleteQuickAdd: (id: number) => void;
};

const FundContext = createContext<FundContextValue | null>(null);

export function FundProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<FundDatabase | null>(null);

  useEffect(() => {
    setDb(loadDatabase());
  }, []);

  const commit = useCallback((updater: (current: FundDatabase) => FundDatabase) => {
    setDb((current) => {
      if (!current) return current;
      const next = updater(current);
      saveDatabase(next);
      return next;
    });
  }, []);

  const value = useMemo<FundContextValue | null>(() => {
    if (!db) return null;

    return {
      ready: true,
      db,
      getTags: () => getTags(db),
      getTagsWithUsage: () => getTagsWithUsage(db),
      getQuickAdds: () => getQuickAdds(db),
      getTransactions: (filters) => getTransactions(db, filters),
      getMonthSummary: (yearMonth) => getMonthSummary(db, yearMonth),
      getRecentTransactions: (limit) => getRecentTransactions(db, limit),
      getAnalyticsChartData: (period) => getAnalyticsChartData(db, period),
      exportTransactionsCsv: () => exportTransactionsCsv(db),
      createTransaction: (data) => commit((current) => createTransaction(current, data)),
      updateTransaction: (id, data) =>
        commit((current) => updateTransaction(current, id, data)),
      deleteTransaction: (id) =>
        commit((current) => deleteTransaction(current, id)),
      createTag: (data) => commit((current) => createTag(current, data)),
      updateTag: (id, data) => commit((current) => updateTag(current, id, data)),
      deleteTag: (id) => commit((current) => deleteTag(current, id)),
      createQuickAdd: (data) =>
        commit((current) => createQuickAdd(current, data)),
      updateQuickAdd: (id, data) =>
        commit((current) => updateQuickAdd(current, id, data)),
      deleteQuickAdd: (id) => commit((current) => deleteQuickAdd(current, id)),
    };
  }, [db, commit]);

  if (!value) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <FundContext.Provider value={value}>{children}</FundContext.Provider>
  );
}

export function useFund() {
  const ctx = useContext(FundContext);
  if (!ctx) {
    throw new Error("useFund must be used within FundProvider");
  }
  return ctx;
}
