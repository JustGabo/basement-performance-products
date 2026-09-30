import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { getCatalog } from "@/lib/commerce/server";
import { getMarketCountry } from "@/lib/commerce/market";

export const metadata: Metadata = {
  title: "Shop Carbon Fiber | Basement Performance Products",
  description: "Shop fiberglass and carbon fiber performance parts for street, show and track builds.",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const params = await searchParams;
  const rawQuery = params.q;
  const initialQuery = typeof rawQuery === "string" ? rawQuery : "";
  const focusSearch = params.focus === "search";
  const country = await getMarketCountry();
  const catalog = await getCatalog(country);
  const products = await catalog.listProducts();

  return <ShopCatalog products={products} initialQuery={initialQuery} focusSearch={focusSearch} />;
}
