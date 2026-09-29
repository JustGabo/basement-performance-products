import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm, type EditableProduct } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin/auth";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ productId }, queryParams] = await Promise.all([params, searchParams]);
  const { admin } = await requireAdmin();
  const [productResult, categoriesResult] = await Promise.all([
    admin.from("products").select("*, product_images(id, image_url, alt_en, is_primary), product_categories(category_id)").eq("id", productId).maybeSingle(),
    admin.from("categories").select("id, name_en").order("sort_order").order("name_en"),
  ]);
  if (!productResult.data) notFound();
  const product = productResult.data as EditableProduct;

  return <section className="flex flex-col gap-7"><AdminPageHeader eyebrow="Catalog editor" title={product.name_en} description={`Editing ${product.sku}. Changes to active products are reflected in the storefront.`} action={<div className="flex items-center gap-4"><Link className="flex items-center gap-2 text-[9px] font-black text-foreground/50 uppercase hover:text-brand" href="/admin/products"><ArrowLeft size={16} />Products</Link>{product.status === "active" && <Link className="flex items-center gap-2 text-[9px] font-black text-brand uppercase" href={`/products/${product.slug}`} target="_blank">Preview<ExternalLink size={14} /></Link>}</div>} /><AdminFeedback error={queryParams.error} saved={queryParams.saved} /><ProductForm product={product} categories={categoriesResult.data ?? []} /></section>;
}
