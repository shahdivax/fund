import { getQuickAddsWithTags } from "@/lib/data/tags";
import type { FundDatabase } from "@/lib/storage/types";
import type { QuickAdd } from "@/lib/types";

export function getQuickAdds(db: FundDatabase): QuickAdd[] {
  return getQuickAddsWithTags(db);
}

export function createQuickAdd(
  db: FundDatabase,
  data: {
    label: string;
    type: "income" | "expense";
    tagId: number | null;
    defaultAmount: number | null;
    icon?: string | null;
  }
): FundDatabase {
  const now = new Date().toISOString();
  const maxOrder = db.quickAdds.reduce((m, q) => Math.max(m, q.sortOrder), -1);

  const quickAdd = {
    id: db.nextQuickAddId,
    label: data.label.trim(),
    type: data.type,
    tagId: data.tagId,
    defaultAmount: data.defaultAmount,
    icon: data.icon ?? null,
    sortOrder: maxOrder + 1,
    createdAt: now,
  };

  return {
    ...db,
    quickAdds: [...db.quickAdds, quickAdd],
    nextQuickAddId: db.nextQuickAddId + 1,
  };
}

export function updateQuickAdd(
  db: FundDatabase,
  id: number,
  data: {
    label?: string;
    type?: "income" | "expense";
    tagId?: number | null;
    defaultAmount?: number | null;
    icon?: string | null;
  }
): FundDatabase {
  return {
    ...db,
    quickAdds: db.quickAdds.map((qa) => {
      if (qa.id !== id) return qa;
      return {
        ...qa,
        label: data.label !== undefined ? data.label.trim() : qa.label,
        type: data.type ?? qa.type,
        tagId: data.tagId !== undefined ? data.tagId : qa.tagId,
        defaultAmount:
          data.defaultAmount !== undefined
            ? data.defaultAmount
            : qa.defaultAmount,
        icon: data.icon !== undefined ? data.icon : qa.icon,
      };
    }),
  };
}

export function deleteQuickAdd(db: FundDatabase, id: number): FundDatabase {
  return {
    ...db,
    quickAdds: db.quickAdds.filter((qa) => qa.id !== id),
  };
}
