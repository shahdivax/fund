import { AnalyticsClient } from "@/components/analytics/analytics-client";
import {
  getSpendByTag,
  getSpendTrend,
  getIncomeVsExpense,
  getTopTagsOverTime,
  getRecurringSplit,
} from "@/lib/actions/analytics";
import { getTagsWithUsage } from "@/lib/actions/tags";
import { getQuickAdds } from "@/lib/actions/quick-adds";
import { getTags } from "@/lib/actions/tags";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const period = 1 as const;

  const [
    spendByTag,
    spendTrend,
    incomeVsExpense,
    topTagsResult,
    recurringSplit,
    tags,
    quickAdds,
    allTags,
  ] = await Promise.all([
    getSpendByTag(period),
    getSpendTrend(period),
    getIncomeVsExpense(period),
    getTopTagsOverTime(period),
    getRecurringSplit(period),
    getTagsWithUsage(),
    getQuickAdds(),
    getTags(),
  ]);

  return (
    <AnalyticsClient
      initialPeriod={period}
      chartData={{
        spendByTag,
        spendTrend,
        incomeVsExpense,
        topTags: topTagsResult.data,
        tagColors: topTagsResult.tagColors,
        recurringSplit,
      }}
      tags={tags}
      quickAdds={quickAdds}
      allTags={allTags}
    />
  );
}
