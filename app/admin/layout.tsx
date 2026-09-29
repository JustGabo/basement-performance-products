import { redirect } from "next/navigation";
import { getShopifyAdminUrl } from "@/lib/shopify/urls";

export const dynamic = "force-dynamic";

export default function AdminLayout() {
  redirect(getShopifyAdminUrl());
}
