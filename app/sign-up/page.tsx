import type { Metadata } from "next";
import AuthPage from "../auth/AuthPage";

export const metadata: Metadata = {
  title: "Create account | Basement Performance Products",
  description: "Create your Basement Performance Products customer account.",
};

export default function SignUpPage() {
  return <AuthPage mode="sign-up" />;
}
