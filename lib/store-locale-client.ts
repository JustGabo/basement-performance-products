export type ClientStoreLocale = "en" | "es";

export function persistStoreLocale(locale: ClientStoreLocale) {
  window.localStorage.setItem("basement-locale", locale);
  document.cookie = `basement-locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.documentElement.setAttribute("lang", locale);
}
