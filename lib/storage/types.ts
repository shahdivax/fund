import type { QuickAdd, Tag, Transaction } from "@/lib/types";

export type FundDatabase = {
  version: 1;
  tags: Tag[];
  quickAdds: QuickAdd[];
  transactions: Transaction[];
  nextTagId: number;
  nextQuickAddId: number;
  nextTransactionId: number;
};

export const STORAGE_KEY = "fund-db-v1";
