import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
};

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center rounded-[var(--radius)] font-medium transition-colors duration-150 disabled:opacity-40",
        variant === "default" &&
          "bg-foreground text-background hover:bg-foreground/90",
        variant === "outline" &&
          "border border-border bg-transparent text-foreground hover:bg-surface",
        variant === "ghost" &&
          "bg-transparent text-foreground hover:bg-surface",
        size === "default" && "min-h-11 px-4 py-2.5 text-sm",
        size === "sm" && "min-h-9 px-3 py-1.5 text-xs",
        size === "lg" && "min-h-12 px-5 py-3 text-sm",
        className
      )}
      {...props}
    />
  );
}
