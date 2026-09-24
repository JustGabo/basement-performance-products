import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";

export const metadata: Metadata = { title: "About | Basement Performance Products" };

export default function AboutPage() {
  return <ContentPage eyebrow={{ en: "Our garage", es: "Nuestro taller" }} title={{ en: "Built from passion.", es: "Nacido de la pasión." }} intro={{ en: "The story, purpose and people behind Basement Performance Products.", es: "La historia, el propósito y las personas detrás de Basement Performance Products." }} sections={[
    { title: { en: "Who we are", es: "Quiénes somos" }, body: { en: "This section will introduce the company, its Dominican roots and its approach to automotive performance.", es: "Esta sección presentará la empresa, sus raíces dominicanas y su visión del rendimiento automotriz." } },
    { title: { en: "What we build", es: "Lo que construimos" }, body: { en: "Here we will explain the products, custom work and standards that define every Basement project.", es: "Aquí explicaremos los productos, trabajos personalizados y estándares que definen cada proyecto Basement." } },
    { title: { en: "Our community", es: "Nuestra comunidad" }, body: { en: "A space for the clients, builders and enthusiasts who keep the culture moving forward.", es: "Un espacio para los clientes, constructores y entusiastas que impulsan esta cultura." } },
  ]} draft />;
}
