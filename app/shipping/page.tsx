import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Shipping",
  description: "How Basement packs and ships parts from the Dominican Republic.",
  path: "/shipping",
});

export default function ShippingPage() {
  return <ContentPage
    eyebrow={{ en: "From the shop", es: "Desde el taller" }}
    title={{ en: "Shipping.", es: "Envíos." }}
    intro={{ en: "Parts leave the Dominican Republic ready to fit. This is how an order moves from the shop to the car.", es: "Las piezas salen de República Dominicana listas para ajustar. Así pasa un pedido del taller al carro." }}
    sections={[
      { title: { en: "Before it ships", es: "Antes de salir" }, body: { en: "In-stock parts are packed after payment clears. Made-to-order and custom-finish pieces take longer, and we confirm that timeline with you before the part ships.", es: "Las piezas en stock se empacan cuando el pago queda confirmado. Las piezas por encargo y los acabados a medida tardan más, y te confirmamos ese plazo antes de enviar." } },
      { title: { en: "Dominican Republic", es: "República Dominicana" }, body: { en: "Local orders are delivered inside the country, or held for pickup when that’s what we arrange with you. Your confirmation says which one applies.", es: "Los pedidos locales se entregan dentro del país, o quedan para recoger cuando así lo coordinamos contigo. La confirmación dice cuál aplica." } },
      { title: { en: "Everywhere else", es: "Fuera del país" }, body: { en: "We ship outside the Dominican Republic. Transit time depends on the destination and the carrier. Import duties, taxes and brokerage are the buyer’s responsibility and are not included in the product price.", es: "Enviamos fuera de República Dominicana. El tiempo de tránsito depende del destino y del transportista. Aranceles, impuestos y gestión de aduana corren por cuenta del comprador y no están incluidos en el precio." } },
      { title: { en: "Tracking and damage", es: "Rastreo y daños" }, body: { en: "When the order leaves the shop, tracking shows in your account. Aero is packed to survive the trip. If a carton arrives damaged, photograph the box and the part before you install anything, then message us.", es: "Cuando el pedido sale del taller, el rastreo aparece en tu cuenta. El aero se empaca para aguantar el viaje. Si una caja llega dañada, fotografía la caja y la pieza antes de instalar nada, y escríbenos." } },
    ]}
  />;
}
