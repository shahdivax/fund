import { getTagMap } from "@/lib/data/relations";
import type { FundDatabase } from "@/lib/storage/types";
import type {
  PeriodMonths,
  TagSpend,
  TrendPoint,
  MonthlyComparison,
  StackedTagMonth,
  RecurringSplit,
} from "@/lib/types";
import { getPeriodRange } from "@/lib/utils/dates";

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

export function getSpendByTag(
  db: FundDatabase,
  periodMonths: PeriodMonths
): TagSpend[] {
  const { start, end } = getPeriodRange(periodMonths);
  const tagMap = getTagMap(db);
  const totals = new Map<number | null, number>();

  for (const t of db.transactions) {
    if (t.type !== "expense") continue;
    if (t.date < start || t.date > end) continue;
    totals.set(t.tagId, (totals.get(t.tagId) ?? 0) + t.amount);
  }

  return [...totals.entries()]
    .map(([tagId, amount]) => {
      const tag = tagId ? tagMap.get(tagId) : null;
      return {
        tagId,
        tagName: tag?.name ?? "Untagged",
        color: tag?.color ?? "#8A8A87",
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function getSpendTrend(
  db: FundDatabase,
  periodMonths: PeriodMonths
): TrendPoint[] {
  const { start, end } = getPeriodRange(periodMonths);
  const daily = new Map<string, number>();

  for (const t of db.transactions) {
    if (t.type !== "expense") continue;
    if (t.date < start || t.date > end) continue;
    daily.set(t.date, (daily.get(t.date) ?? 0) + t.amount);
  }

  const rows = [...daily.entries()].sort(([a], [b]) => a.localeCompare(b));

  if (periodMonths === 1) {
    return rows.map(([date, amount]) => ({
      label: date.slice(8),
      amount,
    }));
  }

  const weekly = new Map<string, number>();
  for (const [date, amount] of rows) {
    const d = new Date(date + "T12:00:00");
    const weekStart = new Date(d);
    const day = d.getDay();
    weekStart.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    const key = weekStart.toISOString().slice(0, 10);
    weekly.set(key, (weekly.get(key) ?? 0) + amount);
  }

  return [...weekly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => ({
      label: key.slice(5),
      amount,
    }));
}

export function getIncomeVsExpense(
  db: FundDatabase,
  periodMonths: PeriodMonths
): MonthlyComparison[] {
  const { start, end } = getPeriodRange(periodMonths);
  const monthMap = new Map<string, { income: number; expense: number }>();

  for (const t of db.transactions) {
    if (t.date < start || t.date > end) continue;
    const month = t.date.slice(0, 7);
    if (!monthMap.has(month)) {
      monthMap.set(month, { income: 0, expense: 0 });
    }
    const entry = monthMap.get(month)!;
    if (t.type === "income") entry.income += t.amount;
    else entry.expense += t.amount;
  }

  return [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: formatMonthLabel(month),
      income: data.income,
      expense: data.expense,
    }));
}

export function getTopTagsOverTime(
  db: FundDatabase,
  periodMonths: PeriodMonths
): { data: StackedTagMonth[]; tagColors: Record<string, string> } {
  const { start, end } = getPeriodRange(periodMonths);
  const tagMap = getTagMap(db);

  type Row = { month: string; tagName: string; color: string; amount: number };
  const rows: Row[] = [];

  const monthTagTotals = new Map<string, Map<string, number>>();

  for (const t of db.transactions) {
    if (t.type !== "expense") continue;
    if (t.date < start || t.date > end) continue;

    const month = t.date.slice(0, 7);
    const tag = t.tagId ? tagMap.get(t.tagId) : null;
    const tagName = tag?.name ?? "Untagged";

    if (!monthTagTotals.has(month)) {
      monthTagTotals.set(month, new Map());
    }
    const tagTotals = monthTagTotals.get(month)!;
    tagTotals.set(tagName, (tagTotals.get(tagName) ?? 0) + t.amount);

    rows.push({
      month,
      tagName,
      color: tag?.color ?? "#8A8A87",
      amount: t.amount,
    });
  }

  const tagTotals = new Map<string, number>();
  const tagColors: Record<string, string> = {};

  for (const r of rows) {
    tagTotals.set(r.tagName, (tagTotals.get(r.tagName) ?? 0) + r.amount);
    if (r.color) tagColors[r.tagName] = r.color;
  }

  const topTags = [...tagTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  tagColors["Other"] = "#8A8A87";

  const monthMap = new Map<string, StackedTagMonth>();

  for (const [month, tagAmounts] of monthTagTotals) {
    const monthKey = formatMonthLabel(month);
    const entry: StackedTagMonth = { month: monthKey };
    for (const t of topTags) entry[t] = 0;
    entry["Other"] = 0;

    for (const [tagName, amount] of tagAmounts) {
      const value = amount / 100;
      if (topTags.includes(tagName)) {
        entry[tagName] = ((entry[tagName] as number) ?? 0) + value;
      } else {
        entry["Other"] = ((entry["Other"] as number) ?? 0) + value;
      }
    }

    monthMap.set(monthKey, entry);
  }

  const data = [...monthMap.values()];
  for (const d of data) {
    for (const t of topTags) {
      d[t] = (d[t] as number) ?? 0;
    }
    d["Other"] = (d["Other"] as number) ?? 0;
  }

  return { data, tagColors };
}

export function getRecurringSplit(
  db: FundDatabase,
  periodMonths: PeriodMonths
): RecurringSplit {
  const { start, end } = getPeriodRange(periodMonths);
  const tagMap = getTagMap(db);

  let recurring = 0;
  let oneOff = 0;

  for (const t of db.transactions) {
    if (t.type !== "expense") continue;
    if (t.date < start || t.date > end) continue;
    const tag = t.tagId ? tagMap.get(t.tagId) : null;
    if (tag?.isRecurring) recurring += t.amount;
    else oneOff += t.amount;
  }

  return { recurring, oneOff };
}

export function getAnalyticsChartData(
  db: FundDatabase,
  periodMonths: PeriodMonths
) {
  const topTagsResult = getTopTagsOverTime(db, periodMonths);
  return {
    spendByTag: getSpendByTag(db, periodMonths),
    spendTrend: getSpendTrend(db, periodMonths),
    incomeVsExpense: getIncomeVsExpense(db, periodMonths),
    topTags: topTagsResult.data,
    tagColors: topTagsResult.tagColors,
    recurringSplit: getRecurringSplit(db, periodMonths),
  };
}
