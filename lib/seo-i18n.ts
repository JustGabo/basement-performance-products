import type { StoreLocale } from "@/lib/commerce/locale";
import { siteDescription, siteName, siteTagline } from "@/lib/seo";

export type PublicSeoPage =
  | "home"
  | "shop"
  | "builds"
  | "about"
  | "contact"
  | "shipping"
  | "returns"
  | "terms"
  | "privacy";

export type LocalizedSeoCopy = {
  title: string;
  description: string;
  absoluteTitle?: boolean;
};

export const siteDescriptionEs =
  "Body kits de fibra de vidrio y carbono, splitters y aero desde República Dominicana. Acabado a mano, probado en el carro, envío internacional.";

export const siteTaglineEs = "Formados en el taller. Probados en la calle.";

export const publicSeoCopy: Record<PublicSeoPage, Record<StoreLocale, LocalizedSeoCopy>> = {
  home: {
    en: {
      title: `${siteName} — ${siteTagline}`,
      description: siteDescription,
      absoluteTitle: true,
    },
    es: {
      title: `${siteName} — ${siteTaglineEs}`,
      description: siteDescriptionEs,
      absoluteTitle: true,
    },
  },
  shop: {
    en: {
      title: "Shop Carbon Fiber & Aero",
      description:
        "Browse fiberglass and carbon fiber body kits, splitters, side skirts and aero parts. Filter by vehicle and part type.",
    },
    es: {
      title: "Tienda de carbono y aero",
      description:
        "Explora body kits, splitters, faldones y piezas de aero en fibra de vidrio y carbono. Filtra por vehículo y tipo de pieza.",
    },
  },
  builds: {
    en: {
      title: "Community Builds",
      description: "Explore customer cars and fiberglass modifications built in the Basement community.",
    },
    es: {
      title: "Proyectos de la comunidad",
      description: "Explora carros de clientes y modificaciones en fibra de la comunidad Basement.",
    },
  },
  about: {
    en: {
      title: "About",
      description: "Basement Performance Products builds fiberglass and carbon fiber aero in the Dominican Republic.",
    },
    es: {
      title: "Nosotros",
      description: "Basement Performance Products fabrica aero en fibra de vidrio y carbono en República Dominicana.",
    },
  },
  contact: {
    en: {
      title: "Contact",
      description: "Ask Basement about fitment, an order, or a custom piece.",
    },
    es: {
      title: "Contacto",
      description: "Pregunta a Basement sobre ajuste, un pedido o una pieza a medida.",
    },
  },
  shipping: {
    en: {
      title: "Shipping",
      description: "How Basement packs and ships parts from the Dominican Republic.",
    },
    es: {
      title: "Envíos",
      description: "Cómo Basement empaca y envía piezas desde República Dominicana.",
    },
  },
  returns: {
    en: {
      title: "Returns",
      description: "How returns work for unused Basement parts, and what can’t come back.",
    },
    es: {
      title: "Devoluciones",
      description: "Cómo funcionan las devoluciones de piezas Basement sin usar y qué no aplica.",
    },
  },
  terms: {
    en: {
      title: "Terms & Conditions",
      description: "The rules for using the Basement site and buying parts.",
    },
    es: {
      title: "Términos y condiciones",
      description: "Las reglas para usar el sitio de Basement y comprar piezas.",
    },
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      description: "What Basement collects when you shop, and what we do with it.",
    },
    es: {
      title: "Política de privacidad",
      description: "Qué recopila Basement cuando compras y qué hacemos con esa información.",
    },
  },
};
