import type { TransactionWithRelations } from "@/lib/types";

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDayHeader(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
}

export function formatMonthHeader(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthStartEnd(yearMonth: string): { start: string; end: string } {
  const [year, month] = yearMonth.split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export function getPeriodRange(months: number): { start: string; end: string } {
  const end = todayISO();
  const endDate = new Date(end + "T12:00:00");
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);
  const start = startDate.toISOString().slice(0, 10);
  return { start, end };
}

export type DayGroup = {
  date: string;
  transactions: TransactionWithRelations[];
  income: number;
  expense: number;
  net: number;
};

export type MonthGroup = {
  yearMonth: string;
  days: DayGroup[];
  income: number;
  expense: number;
  net: number;
};

function sumByType(transactions: TransactionWithRelations[]) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

export function groupTransactionsByMonthAndDay(
  transactions: TransactionWithRelations[]
): MonthGroup[] {
  const monthMap = new Map<string, Map<string, TransactionWithRelations[]>>();

  for (const t of transactions) {
    const yearMonth = t.date.slice(0, 7);
    if (!monthMap.has(yearMonth)) monthMap.set(yearMonth, new Map());
    const dayMap = monthMap.get(yearMonth)!;
    if (!dayMap.has(t.date)) dayMap.set(t.date, []);
    dayMap.get(t.date)!.push(t);
  }

  const months: MonthGroup[] = [];

  for (const [yearMonth, dayMap] of monthMap) {
    const days: DayGroup[] = [];
    let monthIncome = 0;
    let monthExpense = 0;

    const sortedDays = [...dayMap.keys()].sort((a, b) => b.localeCompare(a));

    for (const date of sortedDays) {
      const dayTxns = dayMap.get(date)!;
      dayTxns.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const { income, expense, net } = sumByType(dayTxns);
      monthIncome += income;
      monthExpense += expense;
      days.push({ date, transactions: dayTxns, income, expense, net });
    }

    months.push({
      yearMonth,
      days,
      income: monthIncome,
      expense: monthExpense,
      net: monthIncome - monthExpense,
    });
  }

  months.sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  return months;
}

export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().slice(0, 10);
}
