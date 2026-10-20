export type ClientStoreLocale = "en" | "es";

export function localeFromLangParam(raw: string | null | undefined): ClientStoreLocale | null {
  if (raw === "es") return "es";
  if (raw === "en") return "en";
  return null;
}

export function persistStoreLocale(locale: ClientStoreLocale) {
  window.localStorage.setItem("basement-locale", locale);
  document.cookie = `basement-locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.documentElement.setAttribute("lang", locale);
}

/** Append or strip `?lang=es` to match SEO hreflang URLs (English = clean path). */
export function withStoreLocaleHref(href: string, locale: ClientStoreLocale, origin = "http://localhost") {
  const url = new URL(href, origin);
  if (locale === "es") url.searchParams.set("lang", "es");
  else url.searchParams.delete("lang");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function switchStoreLocale(
  next: ClientStoreLocale,
  router: { replace: (href: string, options?: { scroll?: boolean }) => void; refresh: () => void },
) {
  persistStoreLocale(next);
  const url = new URL(window.location.href);
  if (next === "es") url.searchParams.set("lang", "es");
  else url.searchParams.delete("lang");
  router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  router.refresh();
}
