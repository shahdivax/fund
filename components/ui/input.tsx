import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "focus-ring w-full rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted",
          className
        )}
        {...props}
      />
    );
  }
);
