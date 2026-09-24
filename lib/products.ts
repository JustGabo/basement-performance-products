import type { StoreProduct } from "./commerce";

export const products: StoreProduct[] = [
  { id: "vortex-r35", slug: "vortex-r35", name: "Vortex R35", part: "Carbon front splitter", priceCents: 125000, currency: "USD", image: "/images/hero-car.png", objectPosition: "72% 55%" },
  { id: "apex-g80", slug: "apex-g80", name: "Apex G80", part: "Carbon kidney grille", priceCents: 95000, currency: "USD", image: "/images/performance-parts.png", objectPosition: "62% 52%" },
  { id: "aero-a90", slug: "aero-a90", name: "Aero A90", part: "Carbon rear diffuser", priceCents: 140000, currency: "USD", image: "/images/hero-car.png", objectPosition: "78% 68%" },
  { id: "circuit-fl5", slug: "circuit-fl5", name: "Circuit FL5", part: "Carbon vented hood", priceCents: 110000, currency: "USD", image: "/images/performance-parts.png", objectPosition: "54% 56%" },
  { id: "gt-street-wing", slug: "gt-street-wing", name: "GT Street Wing", part: "Carbon fiber rear wing", priceCents: 168000, currency: "USD", image: "/images/hero-car.png", objectPosition: "52% 18%" },
  { id: "ram-air-system", slug: "ram-air-system", name: "Ram Air System", part: "High-flow intake system", priceCents: 72000, currency: "USD", image: "/images/performance-parts.png", objectPosition: "18% 78%" },
  { id: "track-series", slug: "track-series", name: "Track Series", part: "Forged performance wheel", priceCents: 89000, currency: "USD", image: "/images/hero-car.png", objectPosition: "72% 73%" },
  { id: "club-steering", slug: "club-steering", name: "Club Steering", part: "Carbon steering wheel", priceCents: 64000, currency: "USD", image: "/images/performance-parts.png", objectPosition: "48% 82%" },
  { id: "r35-side-line", slug: "r35-side-line", name: "R35 Side Line", part: "Carbon side skirt extensions", priceCents: 98000, currency: "USD", image: "/images/hero-car.png", objectPosition: "74% 58%" },
  { id: "g80-aero-fins", slug: "g80-aero-fins", name: "G80 Aero Fins", part: "Carbon front canards", priceCents: 52000, currency: "USD", image: "/images/performance-parts.png", objectPosition: "24% 56%" },
  { id: "a90-heat-extract", slug: "a90-heat-extract", name: "A90 Heat Extract", part: "Carbon hood vents", priceCents: 76000, currency: "USD", image: "/images/hero-car.png", objectPosition: "66% 48%" },
  { id: "fl5-rear-spats", slug: "fl5-rear-spats", name: "FL5 Rear Spats", part: "Carbon rear bumper spats", priceCents: 59000, currency: "USD", image: "/images/performance-parts.png", objectPosition: "75% 70%" },
  { id: "swan-neck-gt", slug: "swan-neck-gt", name: "Swan Neck GT", part: "Universal carbon rear wing", priceCents: 185000, currency: "USD", image: "/images/hero-car.png", objectPosition: "50% 20%" },
  { id: "velocity-intake", slug: "velocity-intake", name: "Velocity Intake", part: "Cold air intake system", priceCents: 68000, currency: "USD", image: "/images/performance-parts.png", objectPosition: "22% 76%" },
  { id: "circuit-mono", slug: "circuit-mono", name: "Circuit Mono", part: "Forged monoblock wheel", priceCents: 94000, currency: "USD", image: "/images/hero-car.png", objectPosition: "70% 72%" },
  { id: "driver-carbon", slug: "driver-carbon", name: "Driver Carbon", part: "Carbon performance wheel", priceCents: 69000, currency: "USD", image: "/images/performance-parts.png", objectPosition: "46% 80%" },
];

export { formatPrice } from "./commerce";
