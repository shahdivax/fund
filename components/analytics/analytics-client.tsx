"use client";

import { useState } from "react";
import { PeriodToggle, SectionTabs } from "@/components/analytics/period-toggle";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { ManageTags } from "@/components/analytics/manage-tags";
import { ManageQuickAdds } from "@/components/analytics/manage-quick-adds";
import { ExportButton } from "@/components/analytics/export-button";
import type {
  PeriodMonths,
  TagSpend,
  TrendPoint,
  MonthlyComparison,
  StackedTagMonth,
  RecurringSplit,
  QuickAdd,
  Tag,
} from "@/lib/types";

type AnalyticsClientProps = {
  initialPeriod: PeriodMonths;
  chartData: {
    spendByTag: TagSpend[];
    spendTrend: TrendPoint[];
    incomeVsExpense: MonthlyComparison[];
    topTags: StackedTagMonth[];
    tagColors: Record<string, string>;
    recurringSplit: RecurringSplit;
  };
  tags: (Tag & { usageCount: number })[];
  quickAdds: QuickAdd[];
  allTags: Tag[];
};

export function AnalyticsClient({
  initialPeriod,
  chartData,
  tags,
  quickAdds,
  allTags,
}: AnalyticsClientProps) {
  const [period, setPeriod] = useState<PeriodMonths>(initialPeriod);
  const [tab, setTab] = useState<"graphs" | "manage">("graphs");
  const [data, setData] = useState(chartData);
  const [loading, setLoading] = useState(false);

  const loadPeriod = async (p: PeriodMonths) => {
    setPeriod(p);
    setLoading(true);
    const res = await fetch(`/api/analytics?period=${p}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-4 py-4">
        <h1 className="mb-3 text-sm font-medium">Analytics</h1>
        <PeriodToggle value={period} onChange={loadPeriod} />
      </header>

      <SectionTabs active={tab} onChange={setTab} />

      {tab === "graphs" ? (
        <div className={loading ? "opacity-50" : ""}>
          <AnalyticsCharts period={period} {...data} />
        </div>
      ) : (
        <div>
          <ManageTags tags={tags} />
          <ManageQuickAdds quickAdds={quickAdds} tags={allTags} />
          <ExportButton />
        </div>
      )}
    </div>
  );
}
