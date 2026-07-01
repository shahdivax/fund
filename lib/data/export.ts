import { getTagMap, getQuickAddMap } from "@/lib/data/relations";
import type { FundDatabase } from "@/lib/storage/types";

export function exportTransactionsCsv(db: FundDatabase): string {
  const tagMap = getTagMap(db);
  const quickAddMap = getQuickAddMap(db);

  const rows = [...db.transactions].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date);
    if (dateCmp !== 0) return dateCmp;
    return a.createdAt.localeCompare(b.createdAt);
  });

  const headers = [
    "id",
    "type",
    "amount_paise",
    "amount_rupees",
    "tag",
    "description",
    "quick_add",
    "date",
    "created_at",
    "updated_at",
  ];

  const escape = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => {
      const tagName = r.tagId ? (tagMap.get(r.tagId)?.name ?? "") : "";
      const quickAddLabel = r.quickAddId
        ? (quickAddMap.get(r.quickAddId)?.label ?? "")
        : "";

      return [
        r.id,
        r.type,
        r.amount,
        (r.amount / 100).toFixed(2),
        tagName,
        r.description ?? "",
        quickAddLabel,
        r.date,
        r.createdAt,
        r.updatedAt,
      ]
        .map(escape)
        .join(",");
    }),
  ];

  return lines.join("\n");
}
