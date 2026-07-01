"use client";

import { useMemo, useState } from "react";
import { PeriodToggle, SectionTabs } from "@/components/analytics/period-toggle";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { ManageTags } from "@/components/analytics/manage-tags";
import { ManageQuickAdds } from "@/components/analytics/manage-quick-adds";
import { ExportButton } from "@/components/analytics/export-button";
import { useFund } from "@/lib/store/fund-provider";
import type { PeriodMonths } from "@/lib/types";

export function AnalyticsClient() {
  const fund = useFund();
  const [period, setPeriod] = useState<PeriodMonths>(1);
  const [tab, setTab] = useState<"graphs" | "manage">("graphs");

  const data = useMemo(
    () => fund.getAnalyticsChartData(period),
    [fund, period]
  );

  const tags = fund.getTagsWithUsage();
  const quickAdds = fund.getQuickAdds();
  const allTags = fund.getTags();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-4 py-4">
        <h1 className="mb-3 text-sm font-medium">Analytics</h1>
        <PeriodToggle value={period} onChange={setPeriod} />
      </header>

      <SectionTabs active={tab} onChange={setTab} />

      {tab === "graphs" ? (
        <AnalyticsCharts period={period} {...data} />
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
