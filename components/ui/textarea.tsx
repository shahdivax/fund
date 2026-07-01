import { cn } from "@/lib/utils/cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "focus-ring w-full resize-none rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted",
        className
      )}
      rows={2}
      {...props}
    />
  );
}
