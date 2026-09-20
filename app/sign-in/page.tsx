import type { Metadata } from "next";
import AuthPage from "../auth/AuthPage";

export const metadata: Metadata = {
  title: "Sign in | Basement Performance Products",
  description: "Access your Basement Performance Products customer account.",
};

export default function SignInPage() {
  return <AuthPage mode="sign-in" />;
}
