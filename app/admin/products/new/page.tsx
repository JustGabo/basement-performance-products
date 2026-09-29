import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin/auth";

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const { admin } = await requireAdmin();
  const { data } = await admin.from("categories").select("id, name_en").eq("is_active", true).order("sort_order").order("name_en");
  return <section className="flex flex-col gap-7"><AdminPageHeader eyebrow="Catalog editor" title="New product" description="Create a bilingual product, set inventory and upload its storefront media." action={<Link className="flex items-center gap-2 text-[9px] font-black text-foreground/50 uppercase hover:text-brand" href="/admin/products"><ArrowLeft size={16} />Products</Link>} /><AdminFeedback error={params.error} /><ProductForm categories={data ?? []} /></section>;
}
