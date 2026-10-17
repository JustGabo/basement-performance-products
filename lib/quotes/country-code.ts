const NAME_TO_ISO: Record<string, string> = {
  mexico: "MX",
  méxico: "MX",
  "republica dominicana": "DO",
  "república dominicana": "DO",
  "dominican republic": "DO",
  "united states": "US",
  "estados unidos": "US",
  usa: "US",
  canada: "CA",
  "canadá": "CA",
  colombia: "CO",
  spain: "ES",
  españa: "ES",
  panama: "PA",
  "panamá": "PA",
  puerto: "PR",
  "puerto rico": "PR",
};

export function resolveCountryCodeForShopify(country: string) {
  const trimmed = country.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z]{2}$/.test(trimmed)) return trimmed.toUpperCase();

  const key = trimmed
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

  return NAME_TO_ISO[key] ?? "";
}
