import "server-only";

type ShopifyError = {
  message: string;
};

type ShopifyResponse<T> = {
  data?: T;
  errors?: ShopifyError[];
};

export function hasShopifyConfig() {
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN
      && (process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN
        || process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN),
  );
}

function config() {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN;
  const publicToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2026-07";

  if (!rawDomain || (!privateToken && !publicToken)) {
    throw new Error("Missing Shopify Storefront API configuration.");
  }

  const domain = rawDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (domain.includes("/") || !/^[a-z0-9][a-z0-9.-]+$/i.test(domain)) {
    throw new Error("SHOPIFY_STORE_DOMAIN must be a hostname without a path.");
  }

  return { domain, privateToken, publicToken, apiVersion };
}

export async function storefrontRequest<T>(query: string, variables: Record<string, unknown> = {}) {
  const { domain, privateToken, publicToken, apiVersion } = config();
  const tokenHeader: Record<string, string> = privateToken
    ? { "Shopify-Storefront-Private-Token": privateToken }
    : { "X-Shopify-Storefront-Access-Token": publicToken as string };

  const response = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...tokenHeader,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const payload = await response.json() as ShopifyResponse<T>;

  if (!response.ok || payload.errors?.length || !payload.data) {
    const message = payload.errors?.map((error) => error.message).join("; ")
      || `Shopify Storefront API returned ${response.status}.`;
    throw new Error(message);
  }

  return payload.data;
}
