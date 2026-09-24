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
  images: {
    remotePatterns: supabaseHostname ? [{
      protocol: "https",
      hostname: supabaseHostname,
      pathname: "/storage/v1/object/public/**",
    }] : [],
  },
};

export default nextConfig;
