import "server-only";

const environment = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
const baseUrl = environment === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

let cachedToken: { value: string; expiresAt: number } | null = null;

function credentials() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials are not configured.");
  return { clientId, clientSecret };
}

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const { clientId, clientSecret } = credentials();
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await response.json() as { access_token?: string; expires_in?: number; error_description?: string };
  if (!response.ok || !data.access_token) throw new Error(data.error_description ?? "PayPal authentication failed.");

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(60, data.expires_in ?? 300) * 1000,
  };
  return data.access_token;
}

export async function paypalRequest<T>(path: string, init: RequestInit) {
  const token = await accessToken();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": crypto.randomUUID(),
      ...init.headers,
    },
    cache: "no-store",
  });
  const data = await response.json() as T & { message?: string; details?: Array<{ description?: string }> };
  if (!response.ok) throw new Error(data.details?.[0]?.description ?? data.message ?? "PayPal request failed.");
  return data;
}

export function paypalEnvironment() {
  return environment;
}
