import { getTagMap } from "@/lib/data/relations";
import type { FundDatabase } from "@/lib/storage/types";
import { CHART_COLORS } from "@/lib/constants";
import type { Tag } from "@/lib/types";

export function getTags(db: FundDatabase): Tag[] {
  return [...db.tags].sort((a, b) => a.name.localeCompare(b.name));
}

export function getTagsWithUsage(
  db: FundDatabase
): (Tag & { usageCount: number })[] {
  const usage = new Map<number, number>();
  for (const t of db.transactions) {
    if (t.tagId) {
      usage.set(t.tagId, (usage.get(t.tagId) ?? 0) + 1);
    }
  }

  return getTags(db).map((tag) => ({
    ...tag,
    usageCount: usage.get(tag.id) ?? 0,
  }));
}

export function createTag(
  db: FundDatabase,
  data: {
    name: string;
    color: string;
    isRecurring?: boolean;
  }
): FundDatabase {
  const now = new Date().toISOString();
  const tag: Tag = {
    id: db.nextTagId,
    name: data.name.trim(),
    color: data.color,
    isRecurring: data.isRecurring ?? false,
    createdAt: now,
  };

  return {
    ...db,
    tags: [...db.tags, tag],
    nextTagId: db.nextTagId + 1,
  };
}

export function updateTag(
  db: FundDatabase,
  id: number,
  data: { name?: string; color?: string; isRecurring?: boolean }
): FundDatabase {
  return {
    ...db,
    tags: db.tags.map((tag) => {
      if (tag.id !== id) return tag;
      return {
        ...tag,
        name: data.name !== undefined ? data.name.trim() : tag.name,
        color: data.color ?? tag.color,
        isRecurring: data.isRecurring ?? tag.isRecurring,
      };
    }),
  };
}

export function deleteTag(db: FundDatabase, id: number): FundDatabase {
  const otherTag = db.tags.find((t) => t.name === "Other");
  if (!otherTag) {
    throw new Error("Cannot delete tag");
  }
  if (id === otherTag.id) {
    throw new Error("Cannot delete the Other tag");
  }

  return {
    ...db,
    tags: db.tags.filter((t) => t.id !== id),
    transactions: db.transactions.map((t) =>
      t.tagId === id ? { ...t, tagId: otherTag.id } : t
    ),
  };
}

export function getNextTagColor(db: FundDatabase): string {
  return CHART_COLORS[db.tags.length % CHART_COLORS.length];
}

export function getTagPalette(): string[] {
  return [...CHART_COLORS];
}

export function getQuickAddsWithTags(db: FundDatabase) {
  const tagMap = getTagMap(db);
  return [...db.quickAdds]
    .sort((a, b) => {
      const orderCmp = a.sortOrder - b.sortOrder;
      if (orderCmp !== 0) return orderCmp;
      return a.id - b.id;
    })
    .map((qa) => ({
      ...qa,
      tag: qa.tagId ? (tagMap.get(qa.tagId) ?? null) : null,
    }));
}
