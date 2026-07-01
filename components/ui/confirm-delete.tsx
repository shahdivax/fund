"use client";

import { useState } from "react";
import { Button } from "./button";

export function ConfirmDelete({
  onConfirm,
  label = "Delete",
}: {
  onConfirm: () => void | Promise<void>;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-muted hover:text-expense"
        onClick={() => setConfirming(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted">Sure?</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await onConfirm();
          setLoading(false);
        }}
      >
        Yes
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
      >
        No
      </Button>
    </div>
  );
}
