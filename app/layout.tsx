import type { Metadata } from "next";
import { Geist, Oswald } from "next/font/google";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Basement Performance Products",
  description: "Performance products, real builds and car culture.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${geist.variable} ${oswald.variable} dark`} suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('basement-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t}catch(e){}" }} /></head>
    <body><ThemeProvider><TooltipProvider><CartProvider>{children}</CartProvider><Toaster position="bottom-right" richColors closeButton /></TooltipProvider></ThemeProvider></body>
  </html>;
}
