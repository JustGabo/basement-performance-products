import "server-only";

import { resolveCountryCodeForShopify } from "@/lib/quotes/country-code";

type DraftOrderResult = {
  draftOrderId: string;
  invoiceUrl: string;
};

type AdminBaseConfig = {
  domain: string;
  version: string;
};

let cachedClientCredentialToken: { token: string; expiresAt: number } | null = null;

function shopDomain() {
  return process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "") ?? "";
}

function adminBaseConfig(): AdminBaseConfig | null {
  const domain = shopDomain();
  const version = process.env.SHOPIFY_API_VERSION?.trim() || "2026-07";
  if (!domain) return null;

  const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET?.trim();
  if (staticToken || (clientId && clientSecret)) {
    return { domain, version };
  }

  return null;
}

async function resolveAdminAccessToken(domain: string) {
  const staticToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  if (staticToken) return staticToken;

  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("Shopify Admin API is not configured.");
  }

  const now = Date.now();
  if (cachedClientCredentialToken && cachedClientCredentialToken.expiresAt > now + 60_000) {
    return cachedClientCredentialToken.token;
  }

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Admin token request failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
    error?: string;
  };

  if (!payload.access_token) {
    throw new Error(payload.error_description || payload.error || "Shopify did not return an Admin API access token.");
  }

  const expiresIn = payload.expires_in ?? 86_400;
  cachedClientCredentialToken = {
    token: payload.access_token,
    expiresAt: now + expiresIn * 1000,
  };

  return payload.access_token;
}

export function hasShopifyAdminConfig() {
  return adminBaseConfig() !== null;
}

export async function createInternationalDraftOrder(input: {
  email: string;
  merchandiseId: string;
  quantity: number;
  unitPriceCents: number;
  shippingCents: number;
  currency?: string;
  shippingTitle: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    country: string;
    city: string;
    province?: string;
    zip: string;
    phone?: string;
  };
}): Promise<DraftOrderResult> {
  const config = adminBaseConfig();
  if (!config) {
    throw new Error("Shopify Admin API is not configured.");
  }

  const token = await resolveAdminAccessToken(config.domain);
  const currency = input.currency ?? "USD";
  const unitAmount = (input.unitPriceCents / 100).toFixed(2);

  const [firstName, ...rest] = input.shippingAddress.firstName.split(" ");
  const lastName = input.shippingAddress.lastName || rest.join(" ") || firstName;
  const countryCode = resolveCountryCodeForShopify(input.shippingAddress.country);
  if (!countryCode) {
    throw new Error(
      "Could not map country for Shopify checkout. Ask the customer for a 2-letter code (MX, DO) or add the country name to our map.",
    );
  }

  const response = await fetch(
    `https://${config.domain}/admin/api/${config.version}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({
        query: `
          mutation DraftOrderCreate($input: DraftOrderInput!) {
            draftOrderCreate(input: $input) {
              draftOrder {
                id
                invoiceUrl
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            email: input.email,
            lineItems: [
              {
                variantId: input.merchandiseId,
                quantity: input.quantity,
                originalUnitPriceWithCurrency: {
                  amount: unitAmount,
                  currencyCode: currency,
                },
              },
            ],
            shippingLine: {
              title: input.shippingTitle,
              priceWithCurrency: {
                amount: (input.shippingCents / 100).toFixed(2),
                currencyCode: currency,
              },
            },
            shippingAddress: {
              firstName: firstName || input.shippingAddress.firstName,
              lastName,
              countryCode,
              city: input.shippingAddress.city,
              province: input.shippingAddress.province || "",
              zip: input.shippingAddress.zip,
              phone: input.shippingAddress.phone || "",
            },
          },
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Shopify Admin request failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    data?: {
      draftOrderCreate?: {
        draftOrder?: { id: string; invoiceUrl: string | null };
        userErrors?: Array<{ message: string }>;
      };
    };
    errors?: Array<{ message: string }>;
  };

  const errors = payload.errors?.map((item) => item.message) ?? [];
  const userErrors =
    payload.data?.draftOrderCreate?.userErrors?.map((item) => item.message) ?? [];
  const combined = [...errors, ...userErrors];
  const draft = payload.data?.draftOrderCreate?.draftOrder;
  if (combined.length || !draft?.invoiceUrl) {
    throw new Error(combined.join(" ") || "Shopify could not create the draft order.");
  }

  return { draftOrderId: draft.id, invoiceUrl: draft.invoiceUrl };
}
