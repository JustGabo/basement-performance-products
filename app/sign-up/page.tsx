import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Basement Performance Products customer account.",
  ...privateMetadata,
};

export default function SignUpPage() {
  redirect("/account/login?next=/");
}
