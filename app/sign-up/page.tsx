import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create account | Basement Performance Products",
  description: "Create your Basement Performance Products customer account.",
};

export default function SignUpPage() {
  redirect("/account/login?next=/");
}
