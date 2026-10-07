import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Terms & Conditions",
  description: "The rules for using the Basement site and buying parts.",
  path: "/terms",
});

export default function TermsPage() {
  return <ContentPage
    eyebrow={{ en: "The rules", es: "Las reglas" }}
    title={{ en: "Terms.", es: "Términos." }}
    intro={{ en: "These are the rules for using the site and buying from Basement Performance Products. Ordering means you accept them.", es: "Estas son las reglas para usar el sitio y comprar en Basement Performance Products. Hacer un pedido significa que las aceptas." }}
    sections={[
      { title: { en: "Using the site", es: "Uso del sitio" }, body: { en: "You can browse, create an account and buy parts for your own use. You’re responsible for the accuracy of your account, shipping address and vehicle details. Don’t misuse the site, try to open someone else’s account, or interfere with checkout.", es: "Puedes navegar, crear una cuenta y comprar piezas para tu propio uso. Tú respondes por la exactitud de tu cuenta, tu dirección de envío y los datos del vehículo. No abuses del sitio, no intentes entrar en la cuenta de otra persona y no interfieras con el checkout." } },
      { title: { en: "Fitment", es: "Ajuste" }, body: { en: "Each listing describes the part and the vehicle it was shaped for. You confirm year, make and model before you order. Aftermarket aero can need a test-fit and a small adjustment at the edges. Paint, installation, and any effect on the car — including safety and the rules where you drive — sit with you or your installer.", es: "Cada ficha describe la pieza y el vehículo para el que fue hecha. Tú confirmas año, marca y modelo antes de pedir. El aero de aftermarket puede necesitar una prueba de ajuste y un retoque menor en los bordes. Pintura, instalación y cualquier efecto en el carro —incluida la seguridad y las normas de donde manejas— quedan contigo o con tu instalador." } },
      { title: { en: "Orders and payment", es: "Pedidos y pago" }, body: { en: "An order is an offer to buy. We accept it when payment is authorized and we confirm the order. If you browse from the Dominican Republic, the catalog may show Dominican pesos as a reference. Shopify does not settle in that currency, so checkout and the charge on your card are in USD. Listed prices can change before you place the order. We can cancel an order that looks fraudulent, that we can’t build, or that was priced by mistake. If we cancel, you get back what you paid.", es: "Un pedido es una oferta de compra. Lo aceptamos cuando el pago queda autorizado y confirmamos la orden. Si navegas desde República Dominicana, el catálogo puede mostrar pesos dominicanos como referencia. Shopify no cobra en esa moneda, así que el checkout y el cargo en tu tarjeta son en USD. Los precios publicados pueden cambiar antes de que pidas. Podemos cancelar un pedido que parezca fraudulento, que no podamos fabricar o que haya salido con un precio equivocado. Si cancelamos, te devolvemos lo que pagaste." } },
      { title: { en: "If something’s wrong", es: "Si algo sale mal" }, body: { en: "These are aftermarket parts, not original equipment. We stand behind defects in materials and workmanship: message us with photos before you modify the part. We’re not responsible for installation, paint, track use, or damage that comes from altering a part or from how the car is driven. Nothing here removes rights the law already gives you.", es: "Estas son piezas de aftermarket, no equipo original. Respondemos por defectos de material y de fabricación: escríbenos con fotos antes de modificar la pieza. No respondemos por la instalación, la pintura, el uso en pista ni por daños que vengan de alterar una pieza o de cómo se maneja el carro. Nada de esto quita derechos que la ley ya te da." } },
    ]}
  />;
}
