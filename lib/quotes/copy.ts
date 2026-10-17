export type QuoteLocale = "en" | "es";

export const quoteCopy = {
  en: {
    internationalTitle: "International custom order",
    internationalBody:
      "Outside the United States? Get a personalized shipping quote before placing your order.",
    internationalFooter: "Personalized shipping • International orders • Direct assistance",
    requestCta: "Request a shipping quote",
    openChat: "Continue in your quote chat",
    submitRequest: "Send quote request",
    contactSection: "Contact",
    formTitle: "Shipping details",
    chatBotLabel: "Basement",
    chatYouLabel: "You",
    chatTeamLabel: "Team",
    email: "Email",
    fullName: "Full name",
    country: "Country",
    city: "City / state",
    postalCode: "Postal code",
    quantity: "Quantity",
    phone: "Phone (optional)",
    notes: "Notes (optional)",
    submitIntake: "Send details",
    sendMessage: "Send",
    messagePlaceholder: "Write a message to the team…",
    sending: "Sending…",
    pollError: "Could not refresh messages.",
    payNow: "Review & pay",
    offerLabel: "Your quote",
    product: "Product",
    shipping: "International shipping",
    total: "Total",
    botWelcome: (productName: string) =>
      `Thanks for your interest in ${productName}. To prepare an international shipping quote, send us:\n\n• Country\n• City / state\n• Postal code\n• Quantity\n• Full name\n\nUse the form below so we can reply faster.`,
    botChatOpened: (productName: string, customerName: string) =>
      `Hi ${customerName} — thanks for requesting a quote for ${productName}.`,
    botAfterIntake:
      "We received your shipping details. Our team will confirm international shipping and send your personalized checkout link here and by email.",
    staffOfferIntro: "Your international quote is ready.",
    emailSubject: "Your Basement shipping quote is ready",
    emailPreview: "Review your quote and pay securely through Shopify.",
  },
  es: {
    internationalTitle: "Pedido internacional personalizado",
    internationalBody:
      "¿Fuera de Estados Unidos? Obtén una cotización de envío personalizada antes de hacer tu pedido.",
    internationalFooter: "Envío personalizado • Pedidos internacionales • Atención directa",
    requestCta: "Solicitar cotización de envío",
    openChat: "Continuar en tu chat de cotización",
    submitRequest: "Enviar solicitud",
    contactSection: "Contacto",
    formTitle: "Datos de envío",
    chatBotLabel: "Basement",
    chatYouLabel: "Tú",
    chatTeamLabel: "Equipo",
    email: "Correo",
    fullName: "Nombre completo",
    country: "País",
    city: "Ciudad / provincia",
    postalCode: "Código postal",
    quantity: "Cantidad",
    phone: "Teléfono (opcional)",
    notes: "Notas (opcional)",
    submitIntake: "Enviar datos",
    sendMessage: "Enviar",
    messagePlaceholder: "Escribe un mensaje al equipo…",
    sending: "Enviando…",
    pollError: "No se pudieron actualizar los mensajes.",
    payNow: "Revisar y pagar",
    offerLabel: "Tu cotización",
    product: "Producto",
    shipping: "Envío internacional",
    total: "Total",
    botWelcome: (productName: string) =>
      `Gracias por tu interés en ${productName}. Para preparar una cotización internacional, envíanos:\n\n• País\n• Ciudad / provincia\n• Código postal\n• Cantidad\n• Nombre completo\n\nUsa el formulario de abajo para responder más rápido.`,
    botChatOpened: (productName: string, customerName: string) =>
      `Hola ${customerName} — gracias por solicitar una cotización de ${productName}.`,
    botAfterIntake:
      "Recibimos tus datos de envío. Nuestro equipo confirmará el envío internacional y te mandará el link de checkout personalizado aquí y por correo.",
    staffOfferIntro: "Tu cotización internacional está lista.",
    emailSubject: "Tu cotización de envío Basement está lista",
    emailPreview: "Revisa tu cotización y paga de forma segura con Shopify.",
  },
} as const;

export function formatMoney(cents: number, currency: string, locale: QuoteLocale) {
  return new Intl.NumberFormat(locale === "es" ? "es-DO" : "en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
