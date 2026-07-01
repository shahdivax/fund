import { NextRequest, NextResponse } from "next/server";
import {
  getSpendByTag,
  getSpendTrend,
  getIncomeVsExpense,
  getTopTagsOverTime,
  getRecurringSplit,
} from "@/lib/actions/analytics";
import type { PeriodMonths } from "@/lib/types";

export async function GET(request: NextRequest) {
  const period = Number(request.nextUrl.searchParams.get("period") ?? 1) as PeriodMonths;
  const validPeriod = ([1, 3, 6] as const).includes(period) ? period : 1;

  const [spendByTag, spendTrend, incomeVsExpense, topTagsResult, recurringSplit] =
    await Promise.all([
      getSpendByTag(validPeriod),
      getSpendTrend(validPeriod),
      getIncomeVsExpense(validPeriod),
      getTopTagsOverTime(validPeriod),
      getRecurringSplit(validPeriod),
    ]);

  return NextResponse.json({
    spendByTag,
    spendTrend,
    incomeVsExpense,
    topTags: topTagsResult.data,
    tagColors: topTagsResult.tagColors,
    recurringSplit,
  });
}
