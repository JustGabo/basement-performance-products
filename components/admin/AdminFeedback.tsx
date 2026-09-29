import { CircleAlert, CircleCheck } from "lucide-react";

export function AdminFeedback({ saved, error }: { saved?: string; error?: string }) {
  const message = error || saved;
  if (!message) return null;
  return <div className={`flex items-center gap-3 border px-4 py-3 text-xs ${error ? "border-red-500/35 bg-red-500/10 text-red-400" : "border-emerald-500/35 bg-emerald-500/10 text-emerald-500"}`}>{error ? <CircleAlert size={17} /> : <CircleCheck size={17} />}<span>{message}</span></div>;
}
