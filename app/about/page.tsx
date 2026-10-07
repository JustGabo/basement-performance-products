import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "About",
  description: "Basement Performance Products builds fiberglass and carbon fiber aero in the Dominican Republic.",
  path: "/about",
});

export default function AboutPage() {
  return <ContentPage
    eyebrow={{ en: "Our garage", es: "Nuestro taller" }}
    title={{ en: "Built in the Dominican Republic.", es: "Hecho en República Dominicana." }}
    intro={{ en: "Fiberglass and carbon fiber body kits, shaped in the shop and proven on the street.", es: "Body kits de fibra de vidrio y carbono, formados en el taller y probados en la calle." }}
    sections={[
      { title: { en: "Who we are", es: "Quiénes somos" }, body: { en: "Basement started in a Dominican shop, not a showroom. We design and finish body kits, splitters and aero for cars that still get driven. Every part leaves the shop test-fitted, not just rendered.", es: "Basement nació en un taller dominicano, no en un showroom. Diseñamos y terminamos body kits, splitters y aero para carros que de verdad se manejan. Cada pieza sale del taller probada en el carro, no solo en un render." } },
      { title: { en: "What we build", es: "Lo que construimos" }, body: { en: "Fiberglass and carbon fiber body kits, front lips, splitters, side skirts and the rest of the aero that changes a car’s stance. Pieces are hand-finished and checked against the cars they were shaped for.", es: "Kits de carrocería, labios, splitters, faldones y el resto del aero que cambia la postura de un carro, en fibra de vidrio y carbono. Las piezas se terminan a mano y se comprueban contra los carros para los que fueron hechas." } },
      { title: { en: "The cars", es: "Los carros" }, body: { en: "The builds on this site are customer cars, not studio props. If you run a Basement part, we want it in the gallery. Send the car, the setup and the story to @danielsperformanceparts.", es: "Los proyectos de esta página son carros de clientes, no fotos de estudio. Si llevas una pieza Basement, la queremos en la galería. Manda el carro, el setup y la historia a @danielsperformanceparts." } },
    ]}
  />;
}
