"use server";

import { revalidatePath } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { quickAdds, tags } from "@/lib/db/schema";
import type { QuickAdd, Tag } from "@/lib/types";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/analytics");
}

export async function getQuickAdds(): Promise<QuickAdd[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: quickAdds.id,
      label: quickAdds.label,
      type: quickAdds.type,
      tagId: quickAdds.tagId,
      defaultAmount: quickAdds.defaultAmount,
      icon: quickAdds.icon,
      sortOrder: quickAdds.sortOrder,
      createdAt: quickAdds.createdAt,
      tag: {
        id: tags.id,
        name: tags.name,
        color: tags.color,
        isRecurring: tags.isRecurring,
        createdAt: tags.createdAt,
      },
    })
    .from(quickAdds)
    .leftJoin(tags, eq(quickAdds.tagId, tags.id))
    .orderBy(asc(quickAdds.sortOrder), asc(quickAdds.id));

  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    type: r.type as QuickAdd["type"],
    tagId: r.tagId,
    defaultAmount: r.defaultAmount,
    icon: r.icon,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt,
    tag: r.tag?.id
      ? ({
          id: r.tag.id,
          name: r.tag.name,
          color: r.tag.color,
          isRecurring: r.tag.isRecurring,
          createdAt: r.tag.createdAt,
        } as Tag)
      : null,
  }));
}

export async function createQuickAdd(data: {
  label: string;
  type: "income" | "expense";
  tagId: number | null;
  defaultAmount: number | null;
  icon?: string | null;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = await db.select().from(quickAdds);
  const maxOrder = existing.reduce((m, q) => Math.max(m, q.sortOrder), -1);

  await db.insert(quickAdds).values({
    label: data.label.trim(),
    type: data.type,
    tagId: data.tagId,
    defaultAmount: data.defaultAmount,
    icon: data.icon ?? null,
    sortOrder: maxOrder + 1,
    createdAt: now,
  });
  revalidateAll();
}

export async function updateQuickAdd(
  id: number,
  data: {
    label?: string;
    type?: "income" | "expense";
    tagId?: number | null;
    defaultAmount?: number | null;
    icon?: string | null;
  }
) {
  const db = getDb();
  const updates: Partial<typeof quickAdds.$inferInsert> = {};
  if (data.label !== undefined) updates.label = data.label.trim();
  if (data.type !== undefined) updates.type = data.type;
  if (data.tagId !== undefined) updates.tagId = data.tagId;
  if (data.defaultAmount !== undefined) updates.defaultAmount = data.defaultAmount;
  if (data.icon !== undefined) updates.icon = data.icon;
  await db.update(quickAdds).set(updates).where(eq(quickAdds.id, id));
  revalidateAll();
}

export async function deleteQuickAdd(id: number) {
  const db = getDb();
  await db.delete(quickAdds).where(eq(quickAdds.id, id));
  revalidateAll();
}
