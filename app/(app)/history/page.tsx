import { HistoryClient } from "@/components/history/history-client";
import { getTransactions } from "@/lib/actions/transactions";
import { getTags } from "@/lib/actions/tags";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const [transactions, tags] = await Promise.all([
    getTransactions(),
    getTags(),
  ]);

  return <HistoryClient transactions={transactions} tags={tags} />;
}
