import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";

export const metadata: Metadata = { title: "Terms & Conditions | Basement Performance Products" };

export default function TermsPage() {
  return <ContentPage eyebrow={{ en: "Legal", es: "Legal" }} title={{ en: "Terms & conditions.", es: "Términos y condiciones." }} intro={{ en: "A structured draft for the rules governing use of the site and purchases.", es: "Una estructura preliminar para las reglas de uso del sitio y las compras." }} sections={[
    { title: { en: "Use of the website", es: "Uso del sitio web" }, body: { en: "The final text will define acceptable use, account responsibilities and access requirements.", es: "El texto final definirá el uso aceptable, las responsabilidades de la cuenta y los requisitos de acceso." } },
    { title: { en: "Products and fitment", es: "Productos y compatibilidad" }, body: { en: "This section will cover product information, vehicle compatibility, installation and modification considerations.", es: "Esta sección cubrirá información de productos, compatibilidad vehicular, instalación y modificaciones." } },
    { title: { en: "Orders and payments", es: "Pedidos y pagos" }, body: { en: "Order acceptance, pricing, payment authorization, cancellations and fraud review will be explained here.", es: "Aquí se explicarán la aceptación de pedidos, precios, autorización de pagos, cancelaciones y revisión de fraude." } },
    { title: { en: "Liability and warranties", es: "Responsabilidad y garantías" }, body: { en: "The final terms will state applicable warranty coverage, limitations and the responsibilities of installers and vehicle owners.", es: "Los términos finales establecerán garantías, limitaciones y responsabilidades de instaladores y propietarios." } },
  ]} draft />;
}
