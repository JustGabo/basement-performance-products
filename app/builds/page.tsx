import type { Metadata } from "next";
import { BuildsIndex } from "@/components/builds/BuildsIndex";
import { getStoreLocale } from "@/lib/commerce/locale";
import { getVehicleBuilds } from "@/lib/home-content";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Community Builds",
  description: "Explore customer cars and fiberglass modifications built in the Basement community.",
  path: "/builds",
});

export default async function BuildsPage() {
  const [builds, locale] = await Promise.all([getVehicleBuilds(), getStoreLocale()]);
  return <BuildsIndex builds={builds} locale={locale} />;
}
