import type { FundDatabase } from "@/lib/storage/types";
import type { QuickAdd, Tag, TransactionWithRelations } from "@/lib/types";

export function getTagMap(db: FundDatabase): Map<number, Tag> {
  return new Map(db.tags.map((tag) => [tag.id, tag]));
}

export function getQuickAddMap(db: FundDatabase): Map<number, QuickAdd> {
  const tagMap = getTagMap(db);
  return new Map(
    db.quickAdds.map((qa) => [
      qa.id,
      {
        ...qa,
        tag: qa.tagId ? (tagMap.get(qa.tagId) ?? null) : null,
      },
    ])
  );
}

export function attachRelations(
  db: FundDatabase,
  transaction: FundDatabase["transactions"][number]
): TransactionWithRelations {
  const tagMap = getTagMap(db);
  const quickAddMap = getQuickAddMap(db);

  return {
    ...transaction,
    tag: transaction.tagId ? (tagMap.get(transaction.tagId) ?? null) : null,
    quickAdd: transaction.quickAddId
      ? (quickAddMap.get(transaction.quickAddId) ?? null)
      : null,
  };
}
