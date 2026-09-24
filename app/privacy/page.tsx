import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";

export const metadata: Metadata = { title: "Privacy Policy | Basement Performance Products" };

export default function PrivacyPage() {
  return <ContentPage eyebrow={{ en: "Your data", es: "Tus datos" }} title={{ en: "Privacy policy.", es: "Política de privacidad." }} intro={{ en: "A transparent outline of how customer and visitor information will be handled.", es: "Un esquema transparente sobre cómo se manejará la información de clientes y visitantes." }} sections={[
    { title: { en: "Information collected", es: "Información recopilada" }, body: { en: "The final policy will list account, order, contact, device and usage information collected through the platform.", es: "La política final detallará los datos de cuenta, pedidos, contacto, dispositivo y uso recopilados por la plataforma." } },
    { title: { en: "How information is used", es: "Cómo usamos la información" }, body: { en: "Uses will include account access, order fulfillment, customer support, security and consented communications.", es: "Los usos incluirán acceso a la cuenta, gestión de pedidos, soporte, seguridad y comunicaciones autorizadas." } },
    { title: { en: "Service providers", es: "Proveedores de servicio" }, body: { en: "This section will identify categories of infrastructure, payment, shipping and analytics providers involved in operating the store.", es: "Esta sección identificará las categorías de proveedores de infraestructura, pagos, envíos y analítica que operan la tienda." } },
    { title: { en: "Your choices", es: "Tus opciones" }, body: { en: "The final policy will explain account updates, marketing preferences and applicable data-access or deletion requests.", es: "La política final explicará actualizaciones de cuenta, preferencias de marketing y solicitudes aplicables de acceso o eliminación." } },
  ]} draft />;
}
