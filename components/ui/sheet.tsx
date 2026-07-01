"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function Sheet({ open, onClose, title, children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal
        aria-labelledby="sheet-title"
        className="relative z-10 w-full max-w-lg rounded-t-[var(--radius)] border border-border bg-surface p-4 pb-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="sheet-title" className="text-sm font-medium">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-[var(--radius)] p-1.5 text-muted hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SheetActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex gap-2">{children}</div>;
}

export function SheetSubmit({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button type="submit" className="flex-1" {...props}>
      {children}
    </Button>
  );
}
