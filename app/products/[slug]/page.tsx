import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/ProductDetail";
import { getCatalog } from "@/lib/commerce/server";
import { getMarketCountry } from "@/lib/commerce/market";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog(await getMarketCountry());
  const product = await catalog.getProductBySlug(slug);
  if (!product) return { title: "Product not found | Basement Performance Products" };

  return {
    title: `${product.name} | Basement Performance Products`,
    description: product.description ?? product.part,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const catalog = await getCatalog(await getMarketCountry());
  const product = await catalog.getProductBySlug(slug);
  if (!product) notFound();
  const relatedProducts = (await catalog.listProducts())
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, 4);

  return <ProductDetail product={product} relatedProducts={relatedProducts} />;
}
