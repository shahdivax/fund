import { CHART_COLORS, RECURRING_TAG_NAMES } from "@/lib/constants";
import type { FundDatabase } from "./types";

const SEED_TAGS = [
  "Rent",
  "Groceries",
  "Food",
  "Snacks",
  "Home Loan",
  "Recurring Deposit",
  "Utilities",
  "Transport",
  "Salary",
  "Other",
] as const;

export function createSeedDatabase(): FundDatabase {
  const now = new Date().toISOString();
  const tagIds: Record<string, number> = {};

  const tags = SEED_TAGS.map((name, index) => {
    const id = index + 1;
    tagIds[name] = id;
    return {
      id,
      name,
      color: CHART_COLORS[index % CHART_COLORS.length],
      isRecurring: (RECURRING_TAG_NAMES as readonly string[]).includes(name),
      createdAt: now,
    };
  });

  const quickAddDefs = [
    { label: "Salary", type: "income" as const, tag: "Salary", amount: null },
    { label: "Rent", type: "expense" as const, tag: "Rent", amount: null },
    {
      label: "Home Loan",
      type: "expense" as const,
      tag: "Home Loan",
      amount: null,
    },
    {
      label: "Recurring Deposit",
      type: "expense" as const,
      tag: "Recurring Deposit",
      amount: null,
    },
    { label: "Other", type: "expense" as const, tag: "Other", amount: null },
  ];

  const quickAdds = quickAddDefs.map((qa, index) => ({
    id: index + 1,
    label: qa.label,
    type: qa.type,
    tagId: tagIds[qa.tag],
    defaultAmount: qa.amount,
    icon: null,
    sortOrder: index,
    createdAt: now,
  }));

  return {
    version: 1,
    tags,
    quickAdds,
    transactions: [],
    nextTagId: tags.length + 1,
    nextQuickAddId: quickAdds.length + 1,
    nextTransactionId: 1,
  };
}
