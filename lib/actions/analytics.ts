"use server";

import { eq, and, gte, lte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { transactions, tags } from "@/lib/db/schema";
import type {
  PeriodMonths,
  TagSpend,
  TrendPoint,
  MonthlyComparison,
  StackedTagMonth,
  RecurringSplit,
} from "@/lib/types";
import { getPeriodRange } from "@/lib/utils/dates";

export async function getSpendByTag(periodMonths: PeriodMonths): Promise<TagSpend[]> {
  const { start, end } = getPeriodRange(periodMonths);
  const db = getDb();

  const rows = await db
    .select({
      tagId: transactions.tagId,
      tagName: tags.name,
      color: tags.color,
      amount: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .leftJoin(tags, eq(transactions.tagId, tags.id))
    .where(
      and(
        eq(transactions.type, "expense"),
        gte(transactions.date, start),
        lte(transactions.date, end)
      )
    )
    .groupBy(transactions.tagId)
    .orderBy(sql`sum(${transactions.amount}) desc`);

  return rows.map((r) => ({
    tagId: r.tagId,
    tagName: r.tagName ?? "Untagged",
    color: r.color ?? "#8A8A87",
    amount: r.amount ?? 0,
  }));
}

export async function getSpendTrend(periodMonths: PeriodMonths): Promise<TrendPoint[]> {
  const { start, end } = getPeriodRange(periodMonths);
  const db = getDb();

  const rows = await db
    .select({
      date: transactions.date,
      amount: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.type, "expense"),
        gte(transactions.date, start),
        lte(transactions.date, end)
      )
    )
    .groupBy(transactions.date)
    .orderBy(transactions.date);

  if (periodMonths === 1) {
    return rows.map((r) => ({
      label: r.date.slice(8),
      amount: r.amount ?? 0,
    }));
  }

  const weekly = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(r.date + "T12:00:00");
    const weekStart = new Date(d);
    const day = d.getDay();
    weekStart.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    const key = weekStart.toISOString().slice(0, 10);
    weekly.set(key, (weekly.get(key) ?? 0) + (r.amount ?? 0));
  }

  return [...weekly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => ({
      label: key.slice(5),
      amount,
    }));
}

export async function getIncomeVsExpense(
  periodMonths: PeriodMonths
): Promise<MonthlyComparison[]> {
  const { start, end } = getPeriodRange(periodMonths);
  const db = getDb();

  const rows = await db
    .select({
      month: sql<string>`substr(${transactions.date}, 1, 7)`,
      type: transactions.type,
      amount: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .where(and(gte(transactions.date, start), lte(transactions.date, end)))
    .groupBy(sql`substr(${transactions.date}, 1, 7)`, transactions.type)
    .orderBy(sql`substr(${transactions.date}, 1, 7)`);

  const monthMap = new Map<string, { income: number; expense: number }>();

  for (const r of rows) {
    if (!monthMap.has(r.month)) {
      monthMap.set(r.month, { income: 0, expense: 0 });
    }
    const entry = monthMap.get(r.month)!;
    if (r.type === "income") entry.income = r.amount ?? 0;
    else entry.expense = r.amount ?? 0;
  }

  return [...monthMap.entries()].map(([month, data]) => ({
    month: formatMonthLabel(month),
    income: data.income,
    expense: data.expense,
  }));
}

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export async function getTopTagsOverTime(
  periodMonths: PeriodMonths
): Promise<{ data: StackedTagMonth[]; tagColors: Record<string, string> }> {
  const { start, end } = getPeriodRange(periodMonths);
  const db = getDb();

  const rows = await db
    .select({
      month: sql<string>`substr(${transactions.date}, 1, 7)`,
      tagName: tags.name,
      color: tags.color,
      amount: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .leftJoin(tags, eq(transactions.tagId, tags.id))
    .where(
      and(
        eq(transactions.type, "expense"),
        gte(transactions.date, start),
        lte(transactions.date, end)
      )
    )
    .groupBy(sql`substr(${transactions.date}, 1, 7)`, transactions.tagId)
    .orderBy(sql`substr(${transactions.date}, 1, 7)`);

  const tagTotals = new Map<string, number>();
  const tagColors: Record<string, string> = {};

  for (const r of rows) {
    const name = r.tagName ?? "Untagged";
    tagTotals.set(name, (tagTotals.get(name) ?? 0) + (r.amount ?? 0));
    if (r.color) tagColors[name] = r.color;
  }

  const topTags = [...tagTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  tagColors["Other"] = "#8A8A87";

  const monthMap = new Map<string, StackedTagMonth>();

  for (const r of rows) {
    const monthKey = formatMonthLabel(r.month);
    if (!monthMap.has(monthKey)) {
      const entry: StackedTagMonth = { month: monthKey };
      for (const t of topTags) entry[t] = 0;
      entry["Other"] = 0;
      monthMap.set(monthKey, entry);
    }
    const entry = monthMap.get(monthKey)!;
    const name = r.tagName ?? "Untagged";
    const amount = (r.amount ?? 0) / 100;
    if (topTags.includes(name)) {
      entry[name] = ((entry[name] as number) ?? 0) + amount;
    } else {
      entry["Other"] = ((entry["Other"] as number) ?? 0) + amount;
    }
  }

  const data = [...monthMap.values()];
  for (const d of data) {
    for (const t of topTags) {
      d[t] = ((d[t] as number) ?? 0);
    }
    d["Other"] = ((d["Other"] as number) ?? 0);
  }

  return { data, tagColors };
}

export async function getRecurringSplit(
  periodMonths: PeriodMonths
): Promise<RecurringSplit> {
  const { start, end } = getPeriodRange(periodMonths);
  const db = getDb();

  const rows = await db
    .select({
      isRecurring: tags.isRecurring,
      amount: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .leftJoin(tags, eq(transactions.tagId, tags.id))
    .where(
      and(
        eq(transactions.type, "expense"),
        gte(transactions.date, start),
        lte(transactions.date, end)
      )
    )
    .groupBy(tags.isRecurring);

  let recurring = 0;
  let oneOff = 0;
  for (const r of rows) {
    if (r.isRecurring) recurring = r.amount ?? 0;
    else oneOff = (oneOff ?? 0) + (r.amount ?? 0);
  }

  return { recurring, oneOff };
}
