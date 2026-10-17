import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function ManageQuotesLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="safe-top-header flex h-dvh flex-col overflow-hidden bg-ink text-foreground">
      {children}
    </div>
  );
}
