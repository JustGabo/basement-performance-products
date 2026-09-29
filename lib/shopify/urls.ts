function shopifyDomain() {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN ?? "";
  const domain = rawDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return /^[a-z0-9][a-z0-9.-]+$/i.test(domain) ? domain : null;
}

export function getShopifyAdminUrl() {
  const domain = shopifyDomain();
  return domain ? `https://${domain}/admin` : "/";
}

export function getShopifyCustomerAccountUrl() {
  const override = process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL?.trim();
  if (override) return override;
  const domain = shopifyDomain();
  return domain ? `https://${domain}/account` : "/sign-in";
}
