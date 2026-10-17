import type { Metadata } from "next";
import AuthPage from "@/app/auth/AuthPage";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Staff sign in",
  description: "Sign in to manage international shipping quotes.",
  ...privateMetadata,
};

export default function ManageLoginPage() {
  return <AuthPage mode="sign-in" defaultNext="/manage/quotes" staff />;
}
