import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";

export const metadata: Metadata = { title: "Shipping | Basement Performance Products" };

export default function ShippingPage() {
  return <ContentPage eyebrow={{ en: "Order information", es: "Información de pedidos" }} title={{ en: "Shipping.", es: "Envíos." }} intro={{ en: "How orders are prepared, dispatched and delivered locally and internationally.", es: "Cómo se preparan, despachan y entregan los pedidos locales e internacionales." }} sections={[
    { title: { en: "Processing times", es: "Tiempos de preparación" }, body: { en: "Final processing estimates will be published here, including special timelines for made-to-order components.", es: "Aquí se publicarán los tiempos finales de preparación, incluyendo plazos especiales para piezas fabricadas por encargo." } },
    { title: { en: "Dominican Republic", es: "República Dominicana" }, body: { en: "This area will explain local delivery coverage, pickup options and the carriers available in the country.", es: "Esta área explicará la cobertura local, las opciones de recogida y los transportistas disponibles en el país." } },
    { title: { en: "International orders", es: "Pedidos internacionales" }, body: { en: "International delivery, duties, taxes and oversized-package conditions will be detailed before launch.", es: "Los envíos internacionales, aranceles, impuestos y condiciones de paquetes grandes se detallarán antes del lanzamiento." } },
    { title: { en: "Tracking", es: "Rastreo" }, body: { en: "Once dispatched, eligible orders will show tracking information inside the customer account.", es: "Una vez despachados, los pedidos elegibles mostrarán su rastreo dentro de la cuenta del cliente." } },
  ]} draft />;
}
