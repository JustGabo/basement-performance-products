import type { MetadataRoute } from "next";
import { listCatalogProducts } from "@/lib/commerce/server";
import { getVehicleBuilds } from "@/lib/home-content";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/builds", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.4 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { path: "/shipping", changeFrequency: "monthly", priority: 0.3 },
  { path: "/returns", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];

function sitemapImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://") ? src : absoluteUrl(src);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [{ products }, builds] = await Promise.all([
    listCatalogProducts("US", "en"),
    getVehicleBuilds().catch(() => []),
  ]);

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [sitemapImage(product.image)],
    })),
    ...builds.map((build) => ({
      url: absoluteUrl(build.href),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      images: [sitemapImage(build.src)],
    })),
  ];
}
