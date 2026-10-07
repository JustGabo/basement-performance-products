import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductDetail } from "@/components/products/ProductDetail";
import { CatalogMessage } from "@/components/shop/CatalogMessage";
import { getCatalog, getCatalogProduct } from "@/lib/commerce/server";
import { getMarketCountry } from "@/lib/commerce/market";
import { getStoreLocale } from "@/lib/commerce/locale";
import { privateMetadata, productJsonLd, shareMetadata } from "@/lib/seo";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [country, locale] = await Promise.all([
    getMarketCountry(),
    getStoreLocale(),
  ]);
  const { product, unavailable } = await getCatalogProduct(slug, country, locale);
  if (unavailable) return { title: "Products unavailable", ...privateMetadata };
  if (!product) return { title: "Product not found", ...privateMetadata };

  return shareMetadata({
    title: product.name,
    description: product.description || product.part,
    path: `/products/${product.slug}`,
    image: product.image,
    imageAlt: product.name,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [country, locale] = await Promise.all([
    getMarketCountry(),
    getStoreLocale(),
  ]);
  const { product, unavailable } = await getCatalogProduct(slug, country, locale);
  if (unavailable) return <CatalogMessage locale={locale} kind="unavailable" />;
  if (!product) notFound();
  const catalog = await getCatalog(country, locale);
  const relatedProducts = (await catalog.listProducts().catch(() => []))
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, 4);

  return <>
    <JsonLd data={productJsonLd(product)} />
    <ProductDetail product={product} relatedProducts={relatedProducts} initialLocale={locale} />
  </>;
}
