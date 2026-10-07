import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your Basement Performance Products customer account.",
  ...privateMetadata,
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  if (params.error) return <main className="grid min-h-svh place-items-center bg-ink px-5 text-foreground"><section className="flex max-w-lg flex-col gap-5 border border-red-500/25 bg-panel p-7"><p className="text-[10px] font-black tracking-[.18em] text-red-400 uppercase">Sign-in error</p><h1 className="font-display text-5xl font-bold uppercase">We could not sign you in.</h1><p className="text-sm leading-6 text-foreground/60">{params.error}</p><a className="flex min-h-12 items-center justify-center bg-brand px-6 text-[10px] font-black text-black uppercase" href={`/account/login${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`}>Try again</a></section></main>;
  redirect(`/account/login${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`);
}
