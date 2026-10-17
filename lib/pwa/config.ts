import { siteName } from "@/lib/seo";

/** Shared PWA branding — used by manifest and root layout metadata. */
export const pwaShortName = "Basement";
export const pwaDescription =
  "Shop performance parts, track international shipping quotes, and manage your account from one app.";

export const pwaThemeColor = "#f3b402";
export const pwaBackgroundColor = "#080909";

/** PWA launch URL — full-screen quote list at `/quotes` (admin inbox or customer sessions). */
export const pwaStartUrl = "/quotes";
export const pwaQuotesInboxPath = "/quotes";

export const pwaDisplayName = siteName;
