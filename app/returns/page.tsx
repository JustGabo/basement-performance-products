import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Returns",
  description: "How returns work for unused Basement parts, and what can’t come back.",
  path: "/returns",
});

export default function ReturnsPage() {
  return <ContentPage
    eyebrow={{ en: "Before you bolt it on", es: "Antes de instalar" }}
    title={{ en: "Returns.", es: "Devoluciones." }}
    intro={{ en: "Check the part on the car before paint, drill or install. This is how a return works.", es: "Revisa la pieza en el carro antes de pintar, taladrar o instalar. Así funciona una devolución." }}
    sections={[
      { title: { en: "What can come back", es: "Qué se puede devolver" }, body: { en: "Unused parts in the condition you received them can be returned if they have not been painted, drilled, cut, bonded or installed. Made-to-order and custom-finish pieces are final once production starts, unless we sent the wrong part or it arrived damaged.", es: "Las piezas sin usar, en el estado en que las recibiste, se pueden devolver si no fueron pintadas, taladradas, cortadas, pegadas o instaladas. Las piezas por encargo y los acabados a medida son finales cuando empieza la producción, salvo que hayamos enviado la pieza equivocada o haya llegado dañada." } },
      { title: { en: "Test-fit first", es: "Prueba el ajuste primero" }, body: { en: "Sit the part on the car before any paint or modification. Aftermarket fiberglass and carbon often need a small adjustment at the edges. That’s normal. Once the part is modified, it can’t come back.", es: "Presenta la pieza en el carro antes de pintar o modificar. La fibra de vidrio y el carbono de aftermarket suelen pedir un ajuste menor en los bordes. Es normal. Si la pieza ya fue modificada, no puede regresar." } },
      { title: { en: "How to ask", es: "Cómo pedirla" }, body: { en: "Message @danielsperformanceparts with your order number, photos of the part and the packaging, and a short note on what’s wrong. Do it before you install or alter the part.", es: "Escríbele a @danielsperformanceparts con el número de pedido, fotos de la pieza y del empaque, y una nota corta de qué pasa. Hazlo antes de instalar o alterar la pieza." } },
      { title: { en: "Refunds", es: "Reembolsos" }, body: { en: "If we approve the return, send the part back in the condition you received it. After it passes inspection, the refund goes to the original payment method. Your bank or Shopify decides how long that takes to show.", es: "Si aprobamos la devolución, envía la pieza de vuelta en el estado en que la recibiste. Cuando pasa la revisión, el reembolso vuelve al método de pago original. Tu banco o Shopify define cuánto tarda en verse." } },
    ]}
  />;
}
