export function TagSwatch({
  color,
  className = "",
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-[2px] ${className}`}
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}
