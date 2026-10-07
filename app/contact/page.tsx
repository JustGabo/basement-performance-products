import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Contact",
  description: "Ask Basement about fitment, an order, or a custom piece.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContentPage
    eyebrow={{ en: "The shop", es: "El taller" }}
    title={{ en: "Talk to the shop.", es: "Habla con el taller." }}
    intro={{ en: "Fitment, an order, or a custom piece. Tell us the car and we’ll take it from there.", es: "Compatibilidad, un pedido o una pieza a medida. Dinos el carro y seguimos desde ahí." }}
    sections={[
      { title: { en: "Fitment", es: "Ajuste" }, body: { en: "Send the year, make and model, plus the part you’re looking at. A photo of the bumper or the area you’re changing helps us confirm fitment before you order.", es: "Manda año, marca y modelo, y la pieza que estás viendo. Una foto del bumper o de la zona que vas a modificar nos ayuda a confirmar el ajuste antes de que pidas." } },
      { title: { en: "Orders", es: "Pedidos" }, body: { en: "Include your order number and the email used at checkout. We’ll find the order and tell you where it stands.", es: "Incluye el número de pedido y el correo del checkout. Localizamos la orden y te decimos en qué va." } },
      { title: { en: "Where to write", es: "Dónde escribir" }, body: { en: "Message @danielsperformanceparts on Instagram. That’s the direct line to the shop for fitment, orders and custom work.", es: "Escríbenos a @danielsperformanceparts en Instagram. Esa es la línea directa del taller para ajuste, pedidos y trabajo a medida." } },
    ]}
  />;
}
