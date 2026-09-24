import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";

export const metadata: Metadata = { title: "Returns | Basement Performance Products" };

export default function ReturnsPage() {
  return <ContentPage eyebrow={{ en: "Purchase support", es: "Soporte de compra" }} title={{ en: "Returns & exchanges.", es: "Devoluciones y cambios." }} intro={{ en: "The future home of eligibility, inspection and refund guidelines.", es: "El futuro espacio para requisitos, inspecciones y lineamientos de reembolso." }} sections={[
    { title: { en: "Eligibility", es: "Elegibilidad" }, body: { en: "The final policy will identify return windows, required product condition and excluded custom-made items.", es: "La política final identificará plazos, condición requerida del producto y exclusiones para piezas personalizadas." } },
    { title: { en: "Before installation", es: "Antes de instalar" }, body: { en: "Customers should inspect fitment and finish before painting, drilling, modifying or installing a component.", es: "Los clientes deben revisar ajuste y terminación antes de pintar, perforar, modificar o instalar una pieza." } },
    { title: { en: "Starting a request", es: "Iniciar una solicitud" }, body: { en: "Return requests will require the order number, clear photos and a description of the issue.", es: "Las solicitudes requerirán el número de orden, fotos claras y una descripción del inconveniente." } },
    { title: { en: "Refund timing", es: "Tiempo de reembolso" }, body: { en: "Approved refund methods and processing estimates will be documented in the final policy.", es: "Los métodos aprobados y tiempos de procesamiento se documentarán en la política final." } },
  ]} draft />;
}
