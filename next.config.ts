import type { NextConfig } from "next";

let supabaseHostname: string | undefined;
try {
  supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
    : undefined;
} catch {
  supabaseHostname = undefined;
}

const nextConfig: NextConfig = {
  // Shopify Customer Accounts rejects localhost callbacks, so local sign-in runs through an HTTPS tunnel.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok-free.dev", "*.ngrok.app"],
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      ...(supabaseHostname ? [{
        protocol: "https" as const,
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      }] : []),
    ],
  },
};

export default nextConfig;
