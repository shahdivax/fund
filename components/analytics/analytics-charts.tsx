"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency } from "@/lib/utils/currency";
import type {
  TagSpend,
  TrendPoint,
  MonthlyComparison,
  StackedTagMonth,
  RecurringSplit,
  PeriodMonths,
} from "@/lib/types";

const CHART_TEXT = "#8A8A87";
const CHART_GRID = "#262626";
const TREND_LINE = "#8A8A87";

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
      <p className="mb-3 text-xs text-muted">{title}</p>
      {children}
    </div>
  );
}

function rupees(paise: number) {
  return paise / 100;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name?: string; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[var(--radius)] border border-border bg-background px-2.5 py-1.5 text-xs">
      {label && <p className="mb-1 text-muted">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="tabular-nums text-foreground">
          {p.name ? `${p.name}: ` : ""}
          {formatCurrency(Math.round((p.value ?? 0) * 100))}
        </p>
      ))}
    </div>
  );
}

export function AnalyticsCharts({
  period,
  spendByTag,
  spendTrend,
  incomeVsExpense,
  topTags,
  tagColors,
  recurringSplit,
}: {
  period: PeriodMonths;
  spendByTag: TagSpend[];
  spendTrend: TrendPoint[];
  incomeVsExpense: MonthlyComparison[];
  topTags: StackedTagMonth[];
  tagColors: Record<string, string>;
  recurringSplit: RecurringSplit;
}) {
  const periodLabel =
    period === 1 ? "Last month" : period === 3 ? "Last 3 months" : "Last 6 months";

  const tagBarData = spendByTag.map((t) => ({
    name: t.tagName,
    amount: rupees(t.amount),
    color: t.color,
  }));

  const trendData = spendTrend.map((t) => ({
    label: t.label,
    amount: rupees(t.amount),
  }));

  const comparisonData = incomeVsExpense.map((m) => ({
    month: m.month,
    income: rupees(m.income),
    expense: rupees(m.expense),
  }));

  const stackKeys = topTags.length > 0
    ? Object.keys(topTags[0]).filter((k) => k !== "month")
    : [];

  const recurringData = [
    { name: "Recurring", value: rupees(recurringSplit.recurring) },
    { name: "One-off", value: rupees(recurringSplit.oneOff) },
  ];
  const recurringColors = ["#8A8A87", "#525252"];

  return (
    <div className="space-y-4 px-4 py-4">
      <ChartCard title={`Spend by tag · ${periodLabel}`}>
        {tagBarData.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted">No expenses yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(160, tagBarData.length * 32)}>
            <BarChart data={tagBarData} layout="vertical" margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke={CHART_GRID} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: CHART_TEXT, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fill: CHART_TEXT, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {tagBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title={`Expense trend · ${periodLabel}`}>
        {trendData.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted">No expenses yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData} margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: CHART_TEXT, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_TEXT, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={TREND_LINE}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title={`Income vs expense · ${periodLabel}`}>
        {comparisonData.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={comparisonData} margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: CHART_TEXT, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_TEXT, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="income" fill="#5FA36B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#B85C5C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title={`Top tags over time · ${periodLabel}`}>
        {topTags.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted">No expenses yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topTags} margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: CHART_TEXT, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_TEXT, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} />
              {stackKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="tags"
                  fill={tagColors[key] ?? "#8A8A87"}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title={`Recurring vs one-off · ${periodLabel}`}>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={recurringData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  stroke="none"
                >
                  {recurringData.map((_, i) => (
                    <Cell key={i} fill={recurringColors[i]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted">Recurring</p>
              <p className="tabular-nums">
                {formatCurrency(recurringSplit.recurring)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">One-off</p>
              <p className="tabular-nums">
                {formatCurrency(recurringSplit.oneOff)}
              </p>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
