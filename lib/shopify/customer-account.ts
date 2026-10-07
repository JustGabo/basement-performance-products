import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "bpp_shopify_customer";
const OAUTH_COOKIE = "bpp_shopify_oauth";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const REFRESH_WINDOW_MS = 5 * 60 * 1000;

type OpenIdConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
};

type ApiConfiguration = { graphql_api: string };

type TokenResponse = {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token?: string;
};

export type CustomerSession = {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt: number;
};

type OAuthTransaction = { state: string; nonce: string; next: string; expiresAt: number };

function getConfig() {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET?.trim();
  const callbackUrl = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL?.trim();
  const sessionSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET?.trim();

  if (!rawDomain || !clientId || !clientSecret || !callbackUrl || !sessionSecret) {
    throw new Error("Missing Shopify Customer Account API configuration.");
  }
  if (sessionSecret.length < 32) throw new Error("SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET must contain at least 32 characters.");

  return {
    domain: rawDomain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    clientId,
    clientSecret,
    callbackUrl,
    sessionSecret,
  };
}

function key() {
  return createHash("sha256").update(getConfig().sessionSecret).digest();
}

function seal(value: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

function unseal<T>(value?: string): T | null {
  if (!value) return null;
  try {
    const [iv, tag, encrypted] = value.split(".").map((part) => Buffer.from(part, "base64url"));
    if (!iv || !tag || !encrypted) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")) as T;
  } catch {
    return null;
  }
}

async function discoverAuth(): Promise<OpenIdConfiguration> {
  const { domain } = getConfig();
  const response = await fetch(`https://${domain}/.well-known/openid-configuration`, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`Shopify authentication discovery failed (${response.status}).`);
  return response.json() as Promise<OpenIdConfiguration>;
}

async function discoverApi(): Promise<ApiConfiguration> {
  const { domain } = getConfig();
  const response = await fetch(`https://${domain}/.well-known/customer-account-api`, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`Shopify Customer Account API discovery failed (${response.status}).`);
  return response.json() as Promise<ApiConfiguration>;
}

function safePath(value: string | null | undefined, fallback = "/account") {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function basicAuthorization() {
  const { clientId, clientSecret } = getConfig();
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

function sessionMaxAge(session: CustomerSession) {
  if (session.refreshToken) return SESSION_MAX_AGE;
  return Math.max(60, Math.floor((session.expiresAt - Date.now()) / 1000));
}

function sessionCookieOptions(session: CustomerSession) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: sessionMaxAge(session),
  };
}

async function exchangeRefreshToken(refreshToken: string): Promise<CustomerSession | null> {
  const { clientId } = getConfig();
  const auth = await discoverAuth();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });
  const response = await fetch(auth.token_endpoint, {
    method: "POST",
    headers: {
      "Authorization": basicAuthorization(),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Basement-Performance-Products/1.0",
    },
    body,
    cache: "no-store",
  });
  const token = await response.json() as TokenResponse & { error?: string; error_description?: string };
  if (!response.ok || !token.access_token || !token.id_token) return null;
  return {
    accessToken: token.access_token,
    idToken: token.id_token,
    refreshToken: token.refresh_token || refreshToken,
    expiresAt: Date.now() + token.expires_in * 1000,
  };
}

type SessionCookieUpdate = { value: string; maxAge: number } | { clear: true };

export async function refreshCustomerRequestCookie(getCookie: (name: string) => string | undefined, setCookie: (name: string, value: string) => void): Promise<SessionCookieUpdate | null> {
  let session: CustomerSession | null;
  try {
    session = unseal<CustomerSession>(getCookie(SESSION_COOKIE));
  } catch {
    return null;
  }
  if (!session?.refreshToken || session.expiresAt - Date.now() > REFRESH_WINDOW_MS) return null;

  try {
    const refreshed = await exchangeRefreshToken(session.refreshToken);
    if (!refreshed) {
      if (session.expiresAt <= Date.now() + 30_000) {
        setCookie(SESSION_COOKIE, "");
        return { clear: true };
      }
      return null;
    }
    const value = seal(refreshed);
    setCookie(SESSION_COOKIE, value);
    return { value, maxAge: sessionMaxAge(refreshed) };
  } catch {
    return null;
  }
}

export async function createCustomerAuthorizationUrl(next?: string, locale?: string) {
  const { clientId, callbackUrl } = getConfig();
  const auth = await discoverAuth();
  const transaction: OAuthTransaction = {
    state: randomBytes(32).toString("base64url"),
    nonce: randomBytes(32).toString("base64url"),
    next: safePath(next),
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_COOKIE, seal(transaction), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  const url = new URL(auth.authorization_endpoint);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("state", transaction.state);
  url.searchParams.set("nonce", transaction.nonce);
  if (locale === "es" || locale === "en") url.searchParams.set("locale", locale);
  return url;
}

function tokenNonce(idToken: string) {
  try {
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString("utf8")) as { nonce?: string };
    return payload.nonce;
  } catch {
    return undefined;
  }
}

export async function completeCustomerAuthorization(code: string, state: string) {
  const cookieStore = await cookies();
  const transaction = unseal<OAuthTransaction>(cookieStore.get(OAUTH_COOKIE)?.value);
  cookieStore.delete(OAUTH_COOKIE);
  if (!transaction || transaction.expiresAt < Date.now() || transaction.state !== state) {
    throw new Error("The Shopify sign-in request expired or could not be verified.");
  }

  const { clientId, callbackUrl } = getConfig();
  const auth = await discoverAuth();
  const body = new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, redirect_uri: callbackUrl, code });
  const response = await fetch(auth.token_endpoint, {
    method: "POST",
    headers: {
      "Authorization": basicAuthorization(),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Basement-Performance-Products/1.0",
    },
    body,
    cache: "no-store",
  });
  const token = await response.json() as TokenResponse & { error?: string; error_description?: string };
  if (!response.ok || !token.access_token || !token.id_token) {
    throw new Error(token.error_description || token.error || `Shopify token exchange failed (${response.status}).`);
  }
  if (tokenNonce(token.id_token) !== transaction.nonce) throw new Error("Shopify returned an invalid identity token.");

  const session: CustomerSession = {
    accessToken: token.access_token,
    idToken: token.id_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000,
  };
  cookieStore.set(SESSION_COOKIE, seal(session), sessionCookieOptions(session));
  return transaction.next;
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const session = unseal<CustomerSession>(cookieStore.get(SESSION_COOKIE)?.value);
  return session && session.expiresAt > Date.now() + 30_000 ? session : null;
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  const session = unseal<CustomerSession>(cookieStore.get(SESSION_COOKIE)?.value);
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(OAUTH_COOKIE);
  return session;
}

export async function getCustomerLogoutUrl(idToken?: string) {
  if (!idToken) return new URL("/", getConfig().callbackUrl);
  const auth = await discoverAuth();
  const configured = process.env.SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL?.trim();
  const redirectUrl = configured || new URL("/", getConfig().callbackUrl).toString();
  const url = new URL(auth.end_session_endpoint);
  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", redirectUrl);
  return url;
}

type GraphqlPayload<T> = { data?: T; errors?: Array<{ message: string }> };

export async function customerAccountRequest<T>(query: string, variables: Record<string, unknown> = {}) {
  const session = await getCustomerSession();
  if (!session) return null;
  const { graphql_api } = await discoverApi();
  const response = await fetch(graphql_api, {
    method: "POST",
    headers: { "Authorization": session.accessToken, "Content-Type": "application/json", "User-Agent": "Basement-Performance-Products/1.0" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const payload = await response.json() as GraphqlPayload<T>;
  if (!response.ok || payload.errors?.length || !payload.data) {
    throw new Error(payload.errors?.map(({ message }) => message).join("; ") || `Shopify Customer Account API returned ${response.status}.`);
  }
  return payload.data;
}
