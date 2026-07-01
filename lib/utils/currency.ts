/** Format paise as ₹ with Indian digit grouping */
export function formatCurrency(paise: number): string {
  const rupees = paise / 100;
  const isNegative = rupees < 0;
  const abs = Math.abs(rupees);

  const hasDecimals = Math.round(abs * 100) % 100 !== 0;
  const fixed = hasDecimals ? abs.toFixed(2) : Math.floor(abs).toString();
  const [intPart, decPart] = fixed.split(".");

  let formatted: string;
  if (intPart.length <= 3) {
    formatted = intPart;
  } else {
    const lastThree = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }

  if (decPart) {
    formatted += "." + decPart;
  }

  return `${isNegative ? "-" : ""}₹${formatted}`;
}

/** Parse rupee input string to paise */
export function parseAmountToPaise(input: string): number | null {
  const cleaned = input.replace(/[₹,\s]/g, "").trim();
  if (!cleaned) return null;
  const value = Number(cleaned);
  if (Number.isNaN(value) || value < 0) return null;
  return Math.round(value * 100);
}

/** Format paise as rupees for input fields */
export function paiseToInputValue(paise: number | null): string {
  if (paise === null || paise === 0) return "";
  const rupees = paise / 100;
  return rupees % 1 === 0 ? String(rupees) : rupees.toFixed(2);
}

export function amountColorClass(type: "income" | "expense"): string {
  return type === "income" ? "text-income" : "text-expense";
}

export function netColorClass(net: number): string {
  if (net > 0) return "text-income";
  if (net < 0) return "text-expense";
  return "text-foreground";
}
