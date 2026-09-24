import { HomePage } from "@/components/home/HomePage";
import { getCatalog } from "@/lib/commerce/server";

export default async function Home() {
  const catalog = await getCatalog();
  const products = await catalog.listProducts();

  return <HomePage products={products} />;
}
