import { formatCurrency, amountColorClass } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

export function AmountDisplay({
  amount,
  type,
  className,
  showSign,
}: {
  amount: number;
  type: "income" | "expense";
  className?: string;
  showSign?: boolean;
}) {
  const prefix = showSign ? (type === "income" ? "+" : "−") : "";
  return (
    <span
      className={cn(
        "tabular-nums",
        amountColorClass(type),
        className
      )}
    >
      {prefix}
      {formatCurrency(amount)}
    </span>
  );
}
