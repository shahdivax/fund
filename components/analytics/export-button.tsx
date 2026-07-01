"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportTransactionsCsv } from "@/lib/actions/export";

export function ExportButton() {
  const [pending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const csv = await exportTransactionsCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fund-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <section className="border-t border-border px-4 py-4">
      <h2 className="mb-3 text-sm font-medium">Export</h2>
      <p className="mb-3 text-xs text-muted">
        Download all transactions as CSV with tag names resolved.
      </p>
      <Button variant="outline" onClick={handleExport} disabled={pending}>
        <Download size={16} className="mr-2" aria-hidden />
        {pending ? "Exporting…" : "Export CSV"}
      </Button>
    </section>
  );
}
