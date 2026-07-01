"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sheet, SheetActions, SheetSubmit } from "@/components/ui/sheet";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { TagSwatch } from "@/components/ui/tag-swatch";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/actions/transactions";
import {
  parseAmountToPaise,
  paiseToInputValue,
} from "@/lib/utils/currency";
import { todayISO } from "@/lib/utils/dates";
import type { QuickAdd, Tag, TransactionWithRelations } from "@/lib/types";

type TransactionFormProps = {
  open: boolean;
  onClose: () => void;
  tags: Tag[];
  transaction?: TransactionWithRelations | null;
  quickAdd?: QuickAdd | null;
  mode?: "create" | "edit" | "quick-add";
};

export function TransactionForm({
  open,
  onClose,
  tags,
  transaction,
  quickAdd,
  mode = "create",
}: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [tagId, setTagId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [tagSearch, setTagSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const amountRef = useRef<HTMLInputElement>(null);

  const isEdit = mode === "edit" && transaction;
  const isQuickAdd = mode === "quick-add" && quickAdd;
  const title = isEdit
    ? "Edit entry"
    : isQuickAdd
      ? quickAdd.label
      : "Custom entry";

  useEffect(() => {
    if (!open) return;

    if (transaction) {
      setType(transaction.type);
      setAmount(paiseToInputValue(transaction.amount));
      setTagId(transaction.tagId);
      setDescription(transaction.description ?? "");
      setDate(transaction.date);
    } else if (quickAdd) {
      setType(quickAdd.type);
      setTagId(quickAdd.tagId);
      setDescription("");
      setDate(todayISO());
      setAmount(
        quickAdd.defaultAmount
          ? paiseToInputValue(quickAdd.defaultAmount)
          : ""
      );
    } else {
      setType("expense");
      setAmount("");
      setTagId(null);
      setDescription("");
      setDate(todayISO());
    }
    setTagSearch("");

    const focusTimer = setTimeout(() => {
      if (!quickAdd?.defaultAmount || transaction) {
        amountRef.current?.focus();
      }
    }, 100);
    return () => clearTimeout(focusTimer);
  }, [open, transaction, quickAdd]);

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paise = parseAmountToPaise(amount);
    if (paise === null || paise <= 0) return;

    startTransition(async () => {
      if (isEdit && transaction) {
        await updateTransaction(transaction.id, {
          type,
          amount: paise,
          tagId,
          description: description || null,
          date,
        });
      } else {
        await createTransaction({
          type,
          amount: paise,
          tagId,
          description: description || null,
          quickAddId: quickAdd?.id ?? null,
          date,
        });
      }
      onClose();
    });
  };

  const handleDelete = () => {
    if (!transaction) return;
    startTransition(async () => {
      await deleteTransaction(transaction.id);
      onClose();
    });
  };

  const showTypeToggle = !isQuickAdd && !isEdit;

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {showTypeToggle && (
          <div className="flex gap-2">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`focus-ring flex-1 rounded-[var(--radius)] border py-2.5 text-sm capitalize transition-colors duration-150 ${
                  type === t
                    ? "border-foreground bg-surface text-foreground"
                    : "border-border text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-muted">Amount (₹)</label>
          <Input
            ref={amountRef}
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="tabular-nums text-base"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {!isQuickAdd && (
          <div>
            <label className="mb-1 block text-xs text-muted">Tag</label>
            <Input
              type="text"
              placeholder="Search tags…"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="mb-2"
            />
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
              <button
                type="button"
                onClick={() => setTagId(null)}
                className={`focus-ring rounded-[var(--radius)] border px-2.5 py-1.5 text-xs transition-colors duration-150 ${
                  tagId === null
                    ? "border-foreground text-foreground"
                    : "border-border text-muted"
                }`}
              >
                None
              </button>
              {filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setTagId(tag.id)}
                  className={`focus-ring flex items-center gap-1.5 rounded-[var(--radius)] border px-2.5 py-1.5 text-xs transition-colors duration-150 ${
                    tagId === tag.id
                      ? "border-foreground text-foreground"
                      : "border-border text-muted"
                  }`}
                >
                  <TagSwatch color={tag.color} />
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-muted">
            Note <span className="text-muted/60">(optional)</span>
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
          />
        </div>

        <SheetActions>
          {isEdit && (
            <ConfirmDelete onConfirm={handleDelete} label="Delete" />
          )}
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <SheetSubmit disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save" : "Log"}
          </SheetSubmit>
        </SheetActions>
      </form>
    </Sheet>
  );
}
