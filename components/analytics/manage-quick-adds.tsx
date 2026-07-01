"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagSwatch } from "@/components/ui/tag-swatch";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { useFund } from "@/lib/store/fund-provider";
import {
  parseAmountToPaise,
  paiseToInputValue,
  formatCurrency,
} from "@/lib/utils/currency";
import type { QuickAdd, Tag } from "@/lib/types";

type FormState = {
  label: string;
  type: "income" | "expense";
  tagId: number | null;
  defaultAmount: string;
};

const emptyForm: FormState = {
  label: "",
  type: "expense",
  tagId: null,
  defaultAmount: "",
};

export function ManageQuickAdds({
  quickAdds,
  tags,
}: {
  quickAdds: QuickAdd[];
  tags: Tag[];
}) {
  const fund = useFund();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showNew, setShowNew] = useState(false);
  const [pending, startTransition] = useTransition();

  const startEdit = (qa: QuickAdd) => {
    setEditingId(qa.id);
    setForm({
      label: qa.label,
      type: qa.type,
      tagId: qa.tagId,
      defaultAmount: qa.defaultAmount
        ? paiseToInputValue(qa.defaultAmount)
        : "",
    });
  };

  const save = (id?: number) => {
    if (!form.label.trim()) return;
    const defaultAmount = form.defaultAmount
      ? parseAmountToPaise(form.defaultAmount)
      : null;

    startTransition(() => {
      if (id) {
        fund.updateQuickAdd(id, {
          label: form.label,
          type: form.type,
          tagId: form.tagId,
          defaultAmount,
        });
        setEditingId(null);
      } else {
        fund.createQuickAdd({
          label: form.label,
          type: form.type,
          tagId: form.tagId,
          defaultAmount,
        });
        setShowNew(false);
      }
      setForm(emptyForm);
    });
  };

  const FormFields = ({ onSave }: { onSave: () => void }) => (
    <div className="space-y-3">
      <Input
        placeholder="Label"
        value={form.label}
        onChange={(e) => setForm({ ...form, label: e.target.value })}
      />
      <div className="flex gap-2">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm({ ...form, type: t })}
            className={`focus-ring flex-1 rounded-[var(--radius)] border py-2 text-xs capitalize ${
              form.type === t
                ? "border-foreground text-foreground"
                : "border-border text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <select
        value={form.tagId ?? ""}
        onChange={(e) =>
          setForm({
            ...form,
            tagId: e.target.value ? Number(e.target.value) : null,
          })
        }
        className="focus-ring w-full rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm"
      >
        <option value="">No tag</option>
        {tags.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <Input
        placeholder="Default amount (optional)"
        value={form.defaultAmount}
        onChange={(e) =>
          setForm({ ...form, defaultAmount: e.target.value })
        }
      />
      <Button size="sm" onClick={onSave} disabled={pending}>
        Save
      </Button>
    </div>
  );

  return (
    <section className="border-t border-border px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Quick adds</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowNew(!showNew);
            setForm(emptyForm);
            setEditingId(null);
          }}
        >
          <Plus size={14} className="mr-1" />
          Add
        </Button>
      </div>

      {showNew && (
        <div className="mb-4 rounded-[var(--radius)] border border-border p-3">
          <FormFields onSave={() => save()} />
        </div>
      )}

      <ul className="divide-y divide-border rounded-[var(--radius)] border border-border">
        {quickAdds.map((qa) => (
          <li key={qa.id} className="px-3 py-3">
            {editingId === qa.id ? (
              <div>
                <FormFields onSave={() => save(qa.id)} />
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {qa.tag && <TagSwatch color={qa.tag.color} />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{qa.label}</p>
                  <p className="text-xs text-muted capitalize">
                    {qa.type}
                    {qa.tag ? ` · ${qa.tag.name}` : ""}
                    {qa.defaultAmount
                      ? ` · ${formatCurrency(qa.defaultAmount)}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(qa)}
                  >
                    Edit
                  </Button>
                  <ConfirmDelete
                    label="Delete"
                    onConfirm={() => {
                      fund.deleteQuickAdd(qa.id);
                    }}
                  />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
