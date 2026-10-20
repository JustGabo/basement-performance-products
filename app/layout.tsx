import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { Geist, Oswald } from "next/font/google";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MarketProvider } from "@/components/market/MarketProvider";
import { getStoreLocale } from "@/lib/commerce/locale";
import { getMarketCountry } from "@/lib/commerce/market";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { pwaShortName, pwaThemeColor } from "@/lib/pwa/config";
import { SiteStructuredData } from "@/components/seo/SiteStructuredData";
import { defaultOgImage, siteDescription, siteName, siteTagline, siteUrl } from "@/lib/seo";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  category: "Automotive",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: pwaShortName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    title: siteName,
    description: siteTagline,
    images: [{ url: defaultOgImage, alt: "Basement Performance Products featured build" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteTagline,
    images: [defaultOgImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: pwaThemeColor },
    { media: "(prefers-color-scheme: dark)", color: pwaThemeColor },
  ],
  colorScheme: "dark light",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [marketCountry, locale] = await Promise.all([getMarketCountry(), getStoreLocale()]);
  return (
    <html lang={locale} className={`${geist.variable} ${oswald.variable} dark`} suppressHydrationWarning>
      <body>
        <Script id="basement-theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('basement-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t}catch(e){}`}
        </Script>
        <ThemeProvider>
          <TooltipProvider>
            <MarketProvider initialCountry={marketCountry}>
              <CartProvider>{children}</CartProvider>
            </MarketProvider>
            <Toaster position="bottom-right" closeButton />
          </TooltipProvider>
        </ThemeProvider>
        <PwaRegister />
        <SiteStructuredData />
        <Analytics />
      </body>
    </html>
  );
}
