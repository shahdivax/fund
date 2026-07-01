"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagSwatch } from "@/components/ui/tag-swatch";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { useFund } from "@/lib/store/fund-provider";
import { CHART_COLORS } from "@/lib/constants";
import type { Tag } from "@/lib/types";

export function ManageTags({
  tags,
}: {
  tags: (Tag & { usageCount: number })[];
}) {
  const fund = useFund();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editRecurring, setEditRecurring] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(CHART_COLORS[0]);
  const [showNew, setShowNew] = useState(false);
  const [pending, startTransition] = useTransition();

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
    setEditRecurring(tag.isRecurring);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    startTransition(() => {
      fund.updateTag(editingId, {
        name: editName,
        color: editColor,
        isRecurring: editRecurring,
      });
      setEditingId(null);
    });
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    startTransition(() => {
      fund.createTag({
        name: newName,
        color: newColor,
      });
      setNewName("");
      setShowNew(false);
    });
  };

  return (
    <section className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Tags</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNew(!showNew)}
        >
          <Plus size={14} className="mr-1" />
          Add
        </Button>
      </div>

      {showNew && (
        <div className="mb-4 space-y-3 rounded-[var(--radius)] border border-border p-3">
          <Input
            placeholder="Tag name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {CHART_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className={`focus-ring rounded-[var(--radius)] p-1 ${
                  newColor === c ? "ring-2 ring-foreground/40" : ""
                }`}
              >
                <TagSwatch color={c} className="h-4 w-4" />
              </button>
            ))}
          </div>
          <Button size="sm" onClick={handleCreate} disabled={pending}>
            Create tag
          </Button>
        </div>
      )}

      <ul className="divide-y divide-border rounded-[var(--radius)] border border-border">
        {tags.map((tag) => (
          <li key={tag.id} className="px-3 py-3">
            {editingId === tag.id ? (
              <div className="space-y-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {CHART_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      className={`focus-ring rounded-[var(--radius)] p-1 ${
                        editColor === c ? "ring-2 ring-foreground/40" : ""
                      }`}
                    >
                      <TagSwatch color={c} className="h-4 w-4" />
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={editRecurring}
                    onChange={(e) => setEditRecurring(e.target.checked)}
                    className="focus-ring"
                  />
                  Recurring expense
                </label>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} disabled={pending}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <TagSwatch color={tag.color} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{tag.name}</p>
                  <p className="text-xs text-muted">
                    {tag.usageCount} {tag.usageCount === 1 ? "entry" : "entries"}
                    {tag.isRecurring ? " · recurring" : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(tag)}
                  >
                    Edit
                  </Button>
                  {tag.name !== "Other" && (
                    <ConfirmDelete
                      label="Delete"
                      onConfirm={() => {
                        fund.deleteTag(tag.id);
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
