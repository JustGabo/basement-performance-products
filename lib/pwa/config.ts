import { siteName } from "@/lib/seo";

/** Shared PWA branding — used by manifest and root layout metadata. */
export const pwaShortName = "Basement";
export const pwaDescription =
  "Shop performance parts, track international shipping quotes, and manage your account from one app.";

export const pwaThemeColor = "#f3b402";
export const pwaBackgroundColor = "#080909";

/** Opens the account quote inbox after install (staff + customers with saved sessions). */
export const pwaStartUrl = "/account/quotes";

export const pwaDisplayName = siteName;
