"use server";

import { revalidatePath } from "next/cache";
import { eq, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { tags, transactions } from "@/lib/db/schema";
import { CHART_COLORS } from "@/lib/constants";
import type { Tag } from "@/lib/types";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/analytics");
}

export async function getTags(): Promise<Tag[]> {
  const db = getDb();
  const rows = await db.select().from(tags).orderBy(tags.name);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    isRecurring: r.isRecurring,
    createdAt: r.createdAt,
  }));
}

export async function getTagsWithUsage(): Promise<(Tag & { usageCount: number })[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
      isRecurring: tags.isRecurring,
      createdAt: tags.createdAt,
      usageCount: count(transactions.id),
    })
    .from(tags)
    .leftJoin(transactions, eq(tags.id, transactions.tagId))
    .groupBy(tags.id)
    .orderBy(tags.name);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    isRecurring: r.isRecurring,
    createdAt: r.createdAt,
    usageCount: r.usageCount,
  }));
}

export async function createTag(data: {
  name: string;
  color: string;
  isRecurring?: boolean;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  await db.insert(tags).values({
    name: data.name.trim(),
    color: data.color,
    isRecurring: data.isRecurring ?? false,
    createdAt: now,
  });
  revalidateAll();
}

export async function updateTag(
  id: number,
  data: { name?: string; color?: string; isRecurring?: boolean }
) {
  const db = getDb();
  const updates: Partial<typeof tags.$inferInsert> = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.color !== undefined) updates.color = data.color;
  if (data.isRecurring !== undefined) updates.isRecurring = data.isRecurring;
  await db.update(tags).set(updates).where(eq(tags.id, id));
  revalidateAll();
}

export async function deleteTag(id: number) {
  const db = getDb();
  const otherTag = await db
    .select()
    .from(tags)
    .where(eq(tags.name, "Other"))
    .limit(1);

  if (otherTag.length === 0) {
    throw new Error("Cannot delete tag");
  }

  const otherId = otherTag[0].id;
  if (id === otherId) {
    throw new Error("Cannot delete the Other tag");
  }

  await db
    .update(transactions)
    .set({ tagId: otherId })
    .where(eq(transactions.tagId, id));

  await db.delete(tags).where(eq(tags.id, id));
  revalidateAll();
}

export async function getNextTagColor(): Promise<string> {
  const db = getDb();
  const result = await db.select({ total: count() }).from(tags);
  const total = result[0]?.total ?? 0;
  return CHART_COLORS[total % CHART_COLORS.length];
}

export async function getTagPalette(): Promise<string[]> {
  return [...CHART_COLORS];
}
