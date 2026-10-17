export function QuoteUnreadDot({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block size-2 shrink-0 rounded-full bg-brand shadow-[0_0_0_2px_var(--color-ink)] ${className ?? ""}`}
      aria-hidden
    />
  );
}
