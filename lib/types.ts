export type TransactionType = "income" | "expense";

export type Tag = {
  id: number;
  name: string;
  color: string;
  isRecurring: boolean;
  createdAt: string;
};

export type QuickAdd = {
  id: number;
  label: string;
  type: TransactionType;
  tagId: number | null;
  defaultAmount: number | null;
  icon: string | null;
  sortOrder: number;
  createdAt: string;
  tag?: Tag | null;
};

export type Transaction = {
  id: number;
  type: TransactionType;
  amount: number;
  tagId: number | null;
  description: string | null;
  quickAddId: number | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionWithRelations = Transaction & {
  tag: Tag | null;
  quickAdd: QuickAdd | null;
};

export type PeriodMonths = 1 | 3 | 6;

export type MonthSummary = {
  income: number;
  expense: number;
  net: number;
};

export type TagSpend = {
  tagId: number | null;
  tagName: string;
  color: string;
  amount: number;
};

export type TrendPoint = {
  label: string;
  amount: number;
};

export type MonthlyComparison = {
  month: string;
  income: number;
  expense: number;
};

export type StackedTagMonth = {
  month: string;
  [tagName: string]: string | number;
};

export type RecurringSplit = {
  recurring: number;
  oneOff: number;
};
