"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { getCustomerAuthClient } from "@/lib/customer-auth/client";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { persistStoreLocale } from "@/lib/store-locale-client";

type AuthMode = "sign-in" | "sign-up";
type Locale = "en" | "es";

const copy = {
  en: {
    language: "Language", back: "Back to shop", show: "Show password", hide: "Hide password",
    loading: "Please wait...", mismatch: "Passwords do not match.", autoSignIn: "The account was created, but automatic sign-in is disabled in Supabase.",
    legal: "By continuing, you agree to our", terms: "Terms of Service", privacy: "Privacy Policy", and: "and",
    signIn: { eyebrow: "Member access", title: "Sign in", intro: "Access your orders, saved builds and account details.", email: "Email address", password: "Password", remember: "Keep me signed in", forgot: "Forgot password?", submit: "Sign in", switchLead: "New to Basement?", switchAction: "Create an account" },
    signUp: { eyebrow: "Join the community", title: "Create account", intro: "Save your favorite parts and keep every build in one place.", firstName: "First name", lastName: "Last name", email: "Email address", password: "Create password", confirm: "Confirm password", marketing: "Send me new drops, builds and offers.", terms: "I agree to the Terms of Service and Privacy Policy.", submit: "Create account", switchLead: "Already have an account?", switchAction: "Sign in" },
  },
  es: {
    language: "Idioma", back: "Volver a la tienda", show: "Mostrar contraseña", hide: "Ocultar contraseña",
    loading: "Espera un momento...", mismatch: "Las contraseñas no coinciden.", autoSignIn: "La cuenta se creó, pero el inicio de sesión automático está desactivado en Supabase.",
    legal: "Al continuar, aceptas los", terms: "Términos de servicio", privacy: "Política de privacidad", and: "y la",
    signIn: { eyebrow: "Acceso de clientes", title: "Iniciar sesión", intro: "Accede a tus pedidos, proyectos guardados y datos de tu cuenta.", email: "Correo electrónico", password: "Contraseña", remember: "Mantener mi sesión iniciada", forgot: "¿Olvidaste tu contraseña?", submit: "Iniciar sesión", switchLead: "¿Eres nuevo en Basement?", switchAction: "Crear una cuenta" },
    signUp: { eyebrow: "Únete a la comunidad", title: "Crear cuenta", intro: "Guarda tus piezas favoritas y organiza todos tus proyectos en un solo lugar.", firstName: "Nombre", lastName: "Apellido", email: "Correo electrónico", password: "Crear contraseña", confirm: "Confirmar contraseña", marketing: "Envíame nuevos lanzamientos, proyectos y ofertas.", terms: "Acepto los Términos de servicio y la Política de privacidad.", submit: "Crear cuenta", switchLead: "¿Ya tienes una cuenta?", switchAction: "Iniciar sesión" },
  },
} as const;

const fieldClass = "h-[50px] w-full rounded-sm border border-foreground/20 bg-ink px-4 text-base text-foreground outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/10 [@media(max-height:820px)]:h-[41px]";
const labelClass = "grid gap-2 text-[11px] font-bold tracking-[.06em] text-foreground/80 uppercase [@media(max-height:820px)]:gap-1";

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const t = copy[locale];
  const content = mode === "sign-in" ? t.signIn : t.signUp;
  const switchHref = mode === "sign-in" ? "/sign-up" : "/sign-in";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("basement-locale");
      if (stored === "en" || stored === "es") {
        setLocale(stored);
        document.documentElement.setAttribute("lang", stored);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const changeLocale = (next: Locale) => {
    setLocale(next);
    persistStoreLocale(next);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const auth = getCustomerAuthClient();

      if (mode === "sign-in") {
        await auth.signIn(email, password);
        const requestedPath = new URLSearchParams(window.location.search).get("next");
        router.push(requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/account");
        router.refresh();
        return;
      }

      if (password !== String(form.get("confirmPassword") ?? "")) {
        setError(t.mismatch);
        return;
      }

      const { hasSession } = await auth.signUp({
        email,
        password,
        firstName: String(form.get("firstName") ?? ""),
        lastName: String(form.get("lastName") ?? ""),
        marketingOptIn: form.get("marketing") === "on",
      });
      if (!hasSession) throw new Error(t.autoSignIn);
      router.push("/");
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return <main className={`relative min-h-svh overflow-x-hidden bg-ink text-foreground transition-colors ${mode === "sign-in" ? "h-svh overflow-y-hidden max-[600px]:h-auto max-[600px]:overflow-y-auto" : ""}`}>
    <div aria-hidden="true" className="pointer-events-none fixed -top-[28vw] left-1/2 h-[55vw] w-[72vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(243,180,2,.16),rgba(243,180,2,.035)_38%,transparent_70%)] blur-xl" />
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 opacity-5 dark:opacity-20 [background-image:linear-gradient(rgba(128,128,128,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,.12)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,black_35%,transparent)]" />

    <header className="absolute top-0 left-1/2 z-20 flex h-[72px] w-[min(calc(100%_-_64px),1480px)] -translate-x-1/2 items-center justify-between max-[600px]:h-[58px] max-[600px]:w-[calc(100%_-_32px)]">
      <Link href="/" className="flex items-center gap-2.5 text-xs font-bold tracking-[.08em] text-foreground/65 uppercase transition hover:text-brand max-[600px]:text-[9px]"><ArrowLeft className="text-brand" size={17} />{t.back}</Link>
      <div className="flex items-center gap-2"><div className="flex items-center gap-1 rounded-full border border-foreground/15 bg-panel/70 p-1" role="group" aria-label={t.language}>
        {(["en", "es"] as const).map((item, index) => <span className="contents" key={item}>{index > 0 && <i className="not-italic text-foreground/30">/</i>}<button className={`h-7 min-w-8.5 cursor-pointer rounded-full border-0 text-[10px] font-extrabold ${locale === item ? "bg-brand text-black" : "bg-transparent text-foreground/45"}`} onClick={() => changeLocale(item)} aria-pressed={locale === item}>{item.toUpperCase()}</button></span>)}
      </div><ThemeToggle compact /></div>
    </header>

    <section className="relative z-10 mx-auto flex min-h-svh w-[min(calc(100%_-_32px),500px)] flex-col items-center justify-center gap-3 pt-[72px] pb-7 [@media(max-height:820px)]:gap-0.5 [@media(max-height:820px)]:pt-[58px] [@media(max-height:820px)]:pb-3.5 max-[600px]:gap-1 max-[600px]:pt-[58px] max-[600px]:pb-5" aria-labelledby="auth-title">
      <Link href="/" className="block w-[clamp(235px,22vw,330px)] [@media(max-height:820px)]:w-[185px] max-[600px]:w-[205px]" aria-label="Basement Performance Products home">
        <Image className="h-auto w-full" src="/images/basement-auth-logo-transparent.png" alt="Basement Performance Products" width={1536} height={1024} priority />
      </Link>

      <div className="flex w-full flex-col gap-5 rounded-sm border border-foreground/12 bg-panel/95 p-[clamp(30px,3.2vw,38px)] shadow-[0_30px_90px_rgba(0,0,0,.18)] [@media(max-height:820px)]:gap-3 [@media(max-height:820px)]:px-7 [@media(max-height:820px)]:py-5 max-[600px]:px-5 max-[600px]:py-6">
        <div className="flex flex-col gap-3 [@media(max-height:820px)]:gap-2">
          <div className="flex flex-col gap-2 [@media(max-height:820px)]:gap-1">
            <p className="text-[10px] font-extrabold tracking-[.19em] text-brand uppercase">{content.eyebrow}</p>
            <h1 id="auth-title" className="font-display text-[clamp(40px,5vw,50px)] leading-[.98] font-bold tracking-[-.035em] uppercase [@media(max-height:820px)]:text-[40px]">{content.title}</h1>
          </div>
          <p className="max-w-[390px] text-[13px] leading-6 text-foreground/60 [@media(max-height:820px)]:text-xs">{content.intro}</p>
        </div>

        <form className="grid gap-4 [@media(max-height:820px)]:gap-2.5" onSubmit={handleSubmit}>
          {mode === "sign-up" && <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1 max-[600px]:gap-4">
            <label className={labelClass}><span>{t.signUp.firstName}</span><input className={fieldClass} name="firstName" type="text" autoComplete="given-name" required /></label>
            <label className={labelClass}><span>{t.signUp.lastName}</span><input className={fieldClass} name="lastName" type="text" autoComplete="family-name" required /></label>
          </div>}
          <label className={labelClass}><span>{content.email}</span><input className={fieldClass} name="email" type="email" autoComplete="email" required /></label>
          <label className={labelClass}><span>{content.password}</span><span className="relative block"><input className={`${fieldClass} pr-12`} name="password" type={passwordVisible ? "text" : "password"} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} required /><button type="button" className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 cursor-pointer place-items-center border-0 bg-transparent text-foreground/55" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? t.hide : t.show}>{passwordVisible ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
          {mode === "sign-up" && <label className={labelClass}><span>{t.signUp.confirm}</span><input className={fieldClass} name="confirmPassword" type={passwordVisible ? "text" : "password"} autoComplete="new-password" minLength={8} required /></label>}

          {mode === "sign-in" ? <div className="flex items-start justify-between gap-4 text-[11px] text-foreground/60">
            <label className="flex cursor-pointer items-start gap-2"><input className="size-4 accent-brand" type="checkbox" name="remember" /><span>{t.signIn.remember}</span></label>
            <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-brand">{t.signIn.forgot}</button>
          </div> : <div className="grid gap-3 text-[11px] leading-4 text-foreground/60">
            <label className="flex cursor-pointer items-start gap-2"><input className="size-4 shrink-0 accent-brand" type="checkbox" name="marketing" /><span>{t.signUp.marketing}</span></label>
            <label className="flex cursor-pointer items-start gap-2"><input className="size-4 shrink-0 accent-brand" type="checkbox" name="terms" required /><span>{t.signUp.terms}</span></label>
          </div>}

          <button className="flex h-[52px] w-full cursor-pointer items-center justify-between rounded-sm border border-brand bg-brand px-5 text-xs font-black tracking-[.08em] text-black uppercase transition hover:bg-transparent hover:text-brand disabled:cursor-wait disabled:opacity-60 [@media(max-height:820px)]:h-[43px]" type="submit" disabled={loading}>{loading ? t.loading : content.submit}<ArrowRight size={19} /></button>
          {error && <p className="border-l-2 border-red-500 bg-red-500/8 px-3 py-2.5 text-[11px] leading-4 text-red-500" role="alert">{error}</p>}
        </form>

        <div className="flex flex-col gap-3.5 border-t border-foreground/12 pt-4.5 [@media(max-height:820px)]:gap-2 [@media(max-height:820px)]:pt-3">
          <p className="text-center text-xs text-foreground/60">{content.switchLead} <Link className="text-brand underline underline-offset-3" href={switchHref}>{content.switchAction}</Link></p>
          <p className="text-center text-[9px] leading-4 text-foreground/40">{t.legal} <Link className="text-brand underline underline-offset-3" href="/terms">{t.terms}</Link> {t.and} <Link className="text-brand underline underline-offset-3" href="/privacy">{t.privacy}</Link>.</p>
        </div>
      </div>
    </section>
  </main>;
}
