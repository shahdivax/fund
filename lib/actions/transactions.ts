"use server";

import { revalidatePath } from "next/cache";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { transactions, tags, quickAdds } from "@/lib/db/schema";
import type { TransactionWithRelations, MonthSummary } from "@/lib/types";
import { getCurrentYearMonth, getMonthStartEnd, todayISO } from "@/lib/utils/dates";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/analytics");
}

async function mapTransaction(
  row: {
    id: number;
    type: string;
    amount: number;
    tagId: number | null;
    description: string | null;
    quickAddId: number | null;
    date: string;
    createdAt: string;
    updatedAt: string;
    tag: {
      id: number;
      name: string;
      color: string;
      isRecurring: boolean;
      createdAt: string;
    } | null;
    quickAdd: {
      id: number;
      label: string;
      type: string;
      tagId: number | null;
      defaultAmount: number | null;
      icon: string | null;
      sortOrder: number;
      createdAt: string;
    } | null;
  }
): Promise<TransactionWithRelations> {
  return {
    id: row.id,
    type: row.type as "income" | "expense",
    amount: row.amount,
    tagId: row.tagId,
    description: row.description,
    quickAddId: row.quickAddId,
    date: row.date,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    tag: row.tag?.id
      ? {
          id: row.tag.id,
          name: row.tag.name,
          color: row.tag.color,
          isRecurring: row.tag.isRecurring,
          createdAt: row.tag.createdAt,
        }
      : null,
    quickAdd: row.quickAdd?.id
      ? {
          id: row.quickAdd.id,
          label: row.quickAdd.label,
          type: row.quickAdd.type as "income" | "expense",
          tagId: row.quickAdd.tagId,
          defaultAmount: row.quickAdd.defaultAmount,
          icon: row.quickAdd.icon,
          sortOrder: row.quickAdd.sortOrder,
          createdAt: row.quickAdd.createdAt,
        }
      : null,
  };
}

const txnSelect = {
  id: transactions.id,
  type: transactions.type,
  amount: transactions.amount,
  tagId: transactions.tagId,
  description: transactions.description,
  quickAddId: transactions.quickAddId,
  date: transactions.date,
  createdAt: transactions.createdAt,
  updatedAt: transactions.updatedAt,
  tag: {
    id: tags.id,
    name: tags.name,
    color: tags.color,
    isRecurring: tags.isRecurring,
    createdAt: tags.createdAt,
  },
  quickAdd: {
    id: quickAdds.id,
    label: quickAdds.label,
    type: quickAdds.type,
    tagId: quickAdds.tagId,
    defaultAmount: quickAdds.defaultAmount,
    icon: quickAdds.icon,
    sortOrder: quickAdds.sortOrder,
    createdAt: quickAdds.createdAt,
  },
};

export async function getTransactions(filters?: {
  startDate?: string;
  endDate?: string;
  tagIds?: number[];
  search?: string;
}): Promise<TransactionWithRelations[]> {
  const db = getDb();
  const conditions = [];

  if (filters?.startDate) {
    conditions.push(gte(transactions.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(transactions.date, filters.endDate));
  }
  if (filters?.tagIds && filters.tagIds.length > 0) {
    conditions.push(
      sql`${transactions.tagId} IN (${sql.join(
        filters.tagIds.map((id) => sql`${id}`),
        sql`, `
      )})`
    );
  }

  let rows = await db
    .select(txnSelect)
    .from(transactions)
    .leftJoin(tags, eq(transactions.tagId, tags.id))
    .leftJoin(quickAdds, eq(transactions.quickAddId, quickAdds.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.description?.toLowerCase().includes(q) ||
        r.quickAdd?.label.toLowerCase().includes(q) ||
        r.tag?.name.toLowerCase().includes(q)
    );
  }

  return Promise.all(rows.map(mapTransaction));
}

export async function getTransaction(id: number): Promise<TransactionWithRelations | null> {
  const db = getDb();
  const rows = await db
    .select(txnSelect)
    .from(transactions)
    .leftJoin(tags, eq(transactions.tagId, tags.id))
    .leftJoin(quickAdds, eq(transactions.quickAddId, quickAdds.id))
    .where(eq(transactions.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  return mapTransaction(rows[0]);
}

export async function getMonthSummary(yearMonth?: string): Promise<MonthSummary> {
  const ym = yearMonth ?? getCurrentYearMonth();
  const { start, end } = getMonthStartEnd(ym);
  const db = getDb();

  const rows = await db
    .select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .where(and(gte(transactions.date, start), lte(transactions.date, end)))
    .groupBy(transactions.type);

  let income = 0;
  let expense = 0;
  for (const r of rows) {
    if (r.type === "income") income = r.total ?? 0;
    else expense = r.total ?? 0;
  }

  return { income, expense, net: income - expense };
}

export async function getRecentTransactions(limit = 8): Promise<TransactionWithRelations[]> {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const start = weekStart.toISOString().slice(0, 10);

  const db = getDb();
  const rows = await db
    .select(txnSelect)
    .from(transactions)
    .leftJoin(tags, eq(transactions.tagId, tags.id))
    .leftJoin(quickAdds, eq(transactions.quickAddId, quickAdds.id))
    .where(gte(transactions.date, start))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(limit);

  return Promise.all(rows.map(mapTransaction));
}

export async function createTransaction(data: {
  type: "income" | "expense";
  amount: number;
  tagId: number | null;
  description?: string | null;
  quickAddId?: number | null;
  date?: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  await db.insert(transactions).values({
    type: data.type,
    amount: data.amount,
    tagId: data.tagId,
    description: data.description ?? null,
    quickAddId: data.quickAddId ?? null,
    date: data.date ?? todayISO(),
    createdAt: now,
    updatedAt: now,
  });
  revalidateAll();
}

export async function updateTransaction(
  id: number,
  data: {
    type?: "income" | "expense";
    amount?: number;
    tagId?: number | null;
    description?: string | null;
    date?: string;
  }
) {
  const db = getDb();
  const now = new Date().toISOString();
  const updates: Partial<typeof transactions.$inferInsert> = { updatedAt: now };
  if (data.type !== undefined) updates.type = data.type;
  if (data.amount !== undefined) updates.amount = data.amount;
  if (data.tagId !== undefined) updates.tagId = data.tagId;
  if (data.description !== undefined) updates.description = data.description;
  if (data.date !== undefined) updates.date = data.date;
  await db.update(transactions).set(updates).where(eq(transactions.id, id));
  revalidateAll();
}

export async function deleteTransaction(id: number) {
  const db = getDb();
  await db.delete(transactions).where(eq(transactions.id, id));
  revalidateAll();
}
