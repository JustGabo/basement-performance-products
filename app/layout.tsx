import type { Metadata } from "next";
import { Geist, Oswald } from "next/font/google";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MarketProvider } from "@/components/market/MarketProvider";
import { getMarketCountry } from "@/lib/commerce/market";
import { defaultOgImage, siteDescription, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    title: siteName,
    description: siteDescription,
    images: [{ url: defaultOgImage, alt: "Basement Performance Products featured build" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [defaultOgImage],
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const marketCountry = await getMarketCountry();
  return <html lang="en" className={`${geist.variable} ${oswald.variable} dark`} suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('basement-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t}catch(e){}" }} /></head>
    <body><ThemeProvider><TooltipProvider><MarketProvider initialCountry={marketCountry}><CartProvider>{children}</CartProvider></MarketProvider><Toaster position="bottom-right" closeButton /></TooltipProvider></ThemeProvider></body>
  </html>;
}
