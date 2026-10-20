import { BuildsIndex } from "@/components/builds/BuildsIndex";
import { getStoreLocale } from "@/lib/commerce/locale";
import { getVehicleBuilds } from "@/lib/home-content";
import { generatePublicPageMetadata } from "@/lib/seo-page-metadata";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return generatePublicPageMetadata("builds", "/builds", searchParams);
}

export default async function BuildsPage() {
  const [builds, locale] = await Promise.all([getVehicleBuilds(), getStoreLocale()]);
  return <BuildsIndex builds={builds} locale={locale} />;
}
