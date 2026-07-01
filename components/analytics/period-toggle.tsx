"use client";

import { useState } from "react";
import type { PeriodMonths } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const periods: { value: PeriodMonths; label: string }[] = [
  { value: 1, label: "1 mo" },
  { value: 3, label: "3 mo" },
  { value: 6, label: "6 mo" },
];

export function PeriodToggle({
  value,
  onChange,
}: {
  value: PeriodMonths;
  onChange: (p: PeriodMonths) => void;
}) {
  return (
    <div className="flex gap-1 rounded-[var(--radius)] border border-border p-1">
      {periods.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={cn(
            "focus-ring flex-1 rounded-[6px] px-3 py-1.5 text-xs transition-colors duration-150",
            value === p.value
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function SectionTabs({
  active,
  onChange,
}: {
  active: "graphs" | "manage";
  onChange: (tab: "graphs" | "manage") => void;
}) {
  return (
    <div className="flex border-b border-border">
      {(["graphs", "manage"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "focus-ring flex-1 py-3 text-sm capitalize transition-colors duration-150",
            active === tab
              ? "border-b border-foreground text-foreground"
              : "text-muted"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
