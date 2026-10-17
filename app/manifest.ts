import type { MetadataRoute } from "next";
import {
  pwaBackgroundColor,
  pwaDescription,
  pwaDisplayName,
  pwaShortName,
  pwaStartUrl,
  pwaThemeColor,
} from "@/lib/pwa/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/quotes",
    name: pwaDisplayName,
    short_name: pwaShortName,
    description: pwaDescription,
    start_url: pwaStartUrl,
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: pwaThemeColor,
    background_color: pwaBackgroundColor,
    categories: ["shopping", "business"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Shipping quotes",
        short_name: "Quotes",
        url: "/quotes?tab=pending",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Shop",
        short_name: "Shop",
        url: "/shop",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Orders",
        short_name: "Orders",
        url: "/account/orders",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
