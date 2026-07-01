"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { transactions, tags, quickAdds } from "@/lib/db/schema";

export async function exportTransactionsCsv(): Promise<string> {
  const db = getDb();

  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      tagName: tags.name,
      description: transactions.description,
      quickAddLabel: quickAdds.label,
      date: transactions.date,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
    })
    .from(transactions)
    .leftJoin(tags, eq(transactions.tagId, tags.id))
    .leftJoin(quickAdds, eq(transactions.quickAddId, quickAdds.id))
    .orderBy(transactions.date, transactions.createdAt);

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
    ...rows.map((r) =>
      [
        r.id,
        r.type,
        r.amount,
        (r.amount / 100).toFixed(2),
        r.tagName ?? "",
        r.description ?? "",
        r.quickAddLabel ?? "",
        r.date,
        r.createdAt,
        r.updatedAt,
      ]
        .map(escape)
        .join(",")
    ),
  ];

  return lines.join("\n");
}
