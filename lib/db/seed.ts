import type Database from "better-sqlite3";
import { CHART_COLORS, RECURRING_TAG_NAMES } from "@/lib/constants";

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

export function seedDatabase(sqlite: Database.Database) {
  const now = new Date().toISOString();
  const tagIds: Record<string, number> = {};

  const insertTag = sqlite.prepare(
    `INSERT INTO tags (name, color, is_recurring, created_at) VALUES (?, ?, ?, ?)`
  );

  SEED_TAGS.forEach((name, index) => {
    const isRecurring = (RECURRING_TAG_NAMES as readonly string[]).includes(
      name
    );
    const result = insertTag.run(
      name,
      CHART_COLORS[index % CHART_COLORS.length],
      isRecurring ? 1 : 0,
      now
    );
    tagIds[name] = Number(result.lastInsertRowid);
  });

  const insertQuickAdd = sqlite.prepare(
    `INSERT INTO quick_adds (label, type, tag_id, default_amount, icon, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const quickAdds = [
    { label: "Salary", type: "income", tag: "Salary", amount: null, icon: null },
    { label: "Rent", type: "expense", tag: "Rent", amount: null, icon: null },
    {
      label: "Home Loan",
      type: "expense",
      tag: "Home Loan",
      amount: null,
      icon: null,
    },
    {
      label: "Recurring Deposit",
      type: "expense",
      tag: "Recurring Deposit",
      amount: null,
      icon: null,
    },
    { label: "Other", type: "expense", tag: "Other", amount: null, icon: null },
  ];

  quickAdds.forEach((qa, index) => {
    insertQuickAdd.run(
      qa.label,
      qa.type,
      tagIds[qa.tag],
      qa.amount,
      qa.icon,
      index,
      now
    );
  });

  sqlite
    .prepare(`INSERT INTO _meta (key, value) VALUES ('seeded', '1')`)
    .run();
}
