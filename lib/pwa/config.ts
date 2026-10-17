import { siteName } from "@/lib/seo";

/** Shared PWA branding — used by manifest and root layout metadata. */
export const pwaShortName = "Basement";
export const pwaDescription =
  "Shop performance parts, track international shipping quotes, and manage your account from one app.";

export const pwaThemeColor = "#f3b402";
export const pwaBackgroundColor = "#080909";

/**
 * PWA launch URL. Use `/quotes-inbox` so iOS/Android home-screen bookmarks open the quote inbox
 * (pending tab). Staff can also bookmark that path directly in Safari before “Add to Home Screen”.
 */
export const pwaStartUrl = "/quotes-inbox";
export const pwaQuotesInboxPath = "/account/quotes?tab=pending";

export const pwaDisplayName = siteName;
