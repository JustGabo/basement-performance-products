const tones: Record<string, string> = {
  active: "border-emerald-500/35 bg-emerald-500/10 text-emerald-500",
  paid: "border-emerald-500/35 bg-emerald-500/10 text-emerald-500",
  delivered: "border-emerald-500/35 bg-emerald-500/10 text-emerald-500",
  published: "border-emerald-500/35 bg-emerald-500/10 text-emerald-500",
  processing: "border-sky-500/35 bg-sky-500/10 text-sky-400",
  shipped: "border-sky-500/35 bg-sky-500/10 text-sky-400",
  draft: "border-foreground/20 bg-foreground/5 text-foreground/55",
  pending: "border-brand/35 bg-brand/10 text-brand",
  payment_pending: "border-brand/35 bg-brand/10 text-brand",
  archived: "border-red-500/30 bg-red-500/8 text-red-400",
  cancelled: "border-red-500/30 bg-red-500/8 text-red-400",
  refunded: "border-violet-500/30 bg-violet-500/8 text-violet-400",
};

export function StatusBadge({ value }: { value: string }) {
  return <span className={`inline-flex w-fit items-center border px-2.5 py-1 text-[8px] font-black tracking-[.08em] uppercase ${tones[value] ?? tones.draft}`}>{value.replaceAll("_", " ")}</span>;
}
