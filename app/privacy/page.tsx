import type { Metadata } from "next";
import { ContentPage } from "@/components/site/ContentPage";
import { shareMetadata } from "@/lib/seo";

export const metadata: Metadata = shareMetadata({
  title: "Privacy Policy",
  description: "What Basement collects when you shop, and what we do with it.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <ContentPage
    eyebrow={{ en: "Your data", es: "Tus datos" }}
    title={{ en: "Privacy.", es: "Privacidad." }}
    intro={{ en: "What we collect when you shop with Basement, why we keep it, and how to ask us to let it go.", es: "Qué recopilamos cuando compras en Basement, para qué lo guardamos y cómo pedirnos que lo soltemos." }}
    sections={[
      { title: { en: "What we collect", es: "Qué recopilamos" }, body: { en: "When you create an account or check out, we collect your name, email, phone, shipping address and order details. If you write to us, we keep that conversation so we can answer it. The site also receives basic technical data, such as browser type and pages visited, which we use to keep the store working.", es: "Cuando creas una cuenta o pagas, recopilamos tu nombre, correo, teléfono, dirección de envío y los datos del pedido. Si nos escribes, guardamos esa conversación para poder responderte. El sitio también recibe datos técnicos básicos, como el tipo de navegador y las páginas que visitas, y los usamos para que la tienda siga funcionando." } },
      { title: { en: "Why we use it", es: "Para qué lo usamos" }, body: { en: "We use it to take payment, build and ship your order, show tracking in your account, answer fitment questions, and protect the store from fraud. We send product news only if you ask for it.", es: "Lo usamos para cobrar, fabricar y enviar tu pedido, mostrar el rastreo en tu cuenta, responder preguntas de ajuste y proteger la tienda del fraude. Te mandamos novedades de producto solo si lo pides." } },
      { title: { en: "Who else sees it", es: "Quién más lo ve" }, body: { en: "Payment, accounts and orders run through Shopify. Shipping partners receive the address they need to deliver the part. They get only what’s required to do that job. We don’t sell your information.", es: "El pago, las cuentas y los pedidos corren en Shopify. Los transportistas reciben la dirección que necesitan para entregar la pieza. Solo obtienen lo necesario para ese trabajo. No vendemos tu información." } },
      { title: { en: "Your choices", es: "Tus opciones" }, body: { en: "You can update your details from your account. To stop messages, or to ask what we hold and request deletion, write to @danielsperformanceparts on Instagram. We keep order records for as long as we need them to fulfill orders, handle taxes and resolve disputes.", es: "Puedes actualizar tus datos desde tu cuenta. Para dejar de recibir mensajes, o para preguntar qué guardamos y pedir que lo borremos, escríbele a @danielsperformanceparts en Instagram. Conservamos los registros de pedidos el tiempo que haga falta para cumplir órdenes, impuestos y disputas." } },
    ]}
  />;
}