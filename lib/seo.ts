import type { Metadata } from "next";
import type { StoreProduct } from "@/lib/commerce/domain";

export const siteName = "Basement Performance Products";
export const siteDescription = "Performance products, real builds and car culture.";
export const defaultOgImage = "/images/hero-car.png";

export function siteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    try {
      return new URL(value.includes("://") ? value : `https://${value}`).origin;
    } catch {
      continue;
    }
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl()).toString();
}

export function shareMetadata({
  title,
  description,
  path,
  image = defaultOgImage,
  imageAlt,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | ${siteName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName,
      locale: "en_US",
      url: path,
      title: socialTitle,
      description,
      images: [{ url: image, alt: imageAlt ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
  };
}

export const privateMetadata: Metadata = {
  robots: { index: false, follow: false },
};

function absoluteImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://") ? src : absoluteUrl(src);
}

export function productJsonLd(product: StoreProduct) {
  const images = (product.images?.length ? product.images.map((image) => image.url) : [product.image])
    .filter(Boolean)
    .map(absoluteImage);
  const inStock = product.inventoryQuantity === undefined || product.inventoryQuantity > 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.part,
    sku: product.sku || product.slug,
    image: images,
    brand: { "@type": "Brand", name: siteName },
    ...(product.productType ? { category: product.productType } : {}),
    url: absoluteUrl(`/products/${product.slug}`),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: product.currency || "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}
