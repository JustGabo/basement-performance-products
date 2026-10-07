import { BuildLayout, buildDisplay, buildShell } from "@/components/builds/BuildShell";
import type { StoreLocale } from "@/lib/commerce/locale";

const copy = {
  en: {
    back: "Back home",
    unavailable: {
      title: "Products are unavailable",
      body: "The catalog could not be loaded. Nothing is shown until it is back.",
    },
    empty: {
      title: "No products listed",
      body: "Nothing is available in the shop right now.",
    },
  },
  es: {
    back: "Volver al inicio",
    unavailable: {
      title: "Los productos no están disponibles",
      body: "No se pudo cargar el catálogo. No se muestra nada hasta que vuelva.",
    },
    empty: {
      title: "No hay productos",
      body: "No hay piezas disponibles en la tienda en este momento.",
    },
  },
} as const;

export function CatalogMessage({ locale, kind }: { locale: StoreLocale; kind: "unavailable" | "empty" }) {
  const text = copy[locale];
  const message = text[kind];
  return <BuildLayout backHref="/" backLabel={text.back}>
    <section className={`${buildShell} flex min-h-[50vh] flex-col justify-center gap-3 py-20`}>
      <h1 className={`${buildDisplay} text-[clamp(40px,5vw,64px)] leading-none`}>{message.title}</h1>
      <p className="max-w-md text-sm leading-6 text-foreground/55">{message.body}</p>
    </section>
  </BuildLayout>;
}
