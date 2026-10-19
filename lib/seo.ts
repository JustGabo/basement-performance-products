import type { Metadata } from "next";
import type { StoreProduct } from "@/lib/commerce/domain";

export const siteName = "Basement Performance Products";
export const siteTagline = "Shaped in the shop. Proven on the street.";
export const siteDescription =
  "Fiberglass and carbon fiber body kits, splitters and aero from the Dominican Republic. Hand-finished, test-fitted, shipped worldwide.";
export const defaultOgImage = "/images/hero-car.png";

/** Public Instagram — used in Organization schema and contact copy. */
export const siteInstagramUrl = "https://www.instagram.com/danielsperformanceparts/";

const publicRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

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

export function absoluteImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://") ? src : absoluteUrl(src);
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
  const ogImage = absoluteImage(image);
  const canonical = absoluteUrl(path);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    robots: publicRobots,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName,
      locale: "en_US",
      url: canonical,
      title: socialTitle,
      description,
      images: [{ url: ogImage, alt: imageAlt ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [ogImage],
    },
  };
}

export const privateMetadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl(),
    logo: absoluteImage("/icons/icon-512x512.png"),
    description: siteDescription,
    sameAs: [siteInstagramUrl],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl(),
    description: siteDescription,
    publisher: { "@type": "Organization", name: siteName, url: siteUrl() },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/shop")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
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

export function buildGalleryJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: [absoluteImage(input.image)],
    url: absoluteUrl(input.path),
    author: { "@type": "Organization", name: siteName, url: siteUrl() },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl(),
      logo: { "@type": "ImageObject", url: absoluteImage("/icons/icon-512x512.png") },
    },
  };
}

export function itemListJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
