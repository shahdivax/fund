import { HomeClient } from "@/components/home/home-client";
import { getMonthSummary, getRecentTransactions } from "@/lib/actions/transactions";
import { getQuickAdds } from "@/lib/actions/quick-adds";
import { getTags } from "@/lib/actions/tags";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [summary, quickAdds, recent, tags] = await Promise.all([
    getMonthSummary(),
    getQuickAdds(),
    getRecentTransactions(8),
    getTags(),
  ]);

  return (
    <HomeClient
      summary={summary}
      quickAdds={quickAdds}
      recent={recent}
      tags={tags}
    />
  );
}
