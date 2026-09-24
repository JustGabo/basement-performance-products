import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";

export const metadata: Metadata = { title: "Contact | Basement Performance Products" };

export default function ContactPage() {
  return <ContentPage eyebrow={{ en: "Let’s talk", es: "Hablemos" }} title={{ en: "Contact the Basement.", es: "Contacta al Basement." }} intro={{ en: "Questions about fitment, availability or a custom project? Start here.", es: "¿Preguntas sobre compatibilidad, disponibilidad o un proyecto personalizado? Empieza aquí." }} sections={[
    { title: { en: "Product questions", es: "Preguntas de productos" }, body: { en: "Share the year, make and model of your vehicle when asking about product compatibility.", es: "Comparte el año, marca y modelo de tu vehículo cuando consultes sobre compatibilidad." } },
    { title: { en: "Orders and support", es: "Pedidos y soporte" }, body: { en: "For order support, include your order number so the team can locate the purchase quickly.", es: "Para soporte de pedidos, incluye tu número de orden para localizar la compra rápidamente." } },
    { title: { en: "Current contact channel", es: "Canal de contacto actual" }, body: { en: "Until the complete support form is connected, contact the team through @danielsperformanceparts on Instagram.", es: "Hasta conectar el formulario de soporte, contacta al equipo mediante @danielsperformanceparts en Instagram." } },
  ]} draft />;
}
