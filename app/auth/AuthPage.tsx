"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type AuthMode = "sign-in" | "sign-up";
type Locale = "en" | "es";

const copy = {
  en: {
    language: "Language", back: "Back to shop", show: "Show password", hide: "Hide password",
    pending: "Account authentication will be available when the secure customer database is connected.",
    legal: "By continuing, you agree to our", terms: "Terms of Service", privacy: "Privacy Policy", and: "and",
    signIn: { eyebrow: "Member access", title: "Sign in", intro: "Access your orders, saved builds and account details.", email: "Email address", password: "Password", remember: "Keep me signed in", forgot: "Forgot password?", submit: "Sign in", switchLead: "New to Basement?", switchAction: "Create an account" },
    signUp: { eyebrow: "Join the community", title: "Create account", intro: "Save your favorite parts and keep every build in one place.", firstName: "First name", lastName: "Last name", email: "Email address", password: "Create password", confirm: "Confirm password", marketing: "Send me new drops, builds and offers.", terms: "I agree to the Terms of Service and Privacy Policy.", submit: "Create account", switchLead: "Already have an account?", switchAction: "Sign in" },
  },
  es: {
    language: "Idioma", back: "Volver a la tienda", show: "Mostrar contraseña", hide: "Ocultar contraseña",
    pending: "La autenticación estará disponible cuando conectemos la base de datos segura de clientes.",
    legal: "Al continuar, aceptas nuestros", terms: "Términos de servicio", privacy: "Política de privacidad", and: "y la",
    signIn: { eyebrow: "Acceso de clientes", title: "Iniciar sesión", intro: "Accede a tus pedidos, proyectos guardados y datos de cuenta.", email: "Correo electrónico", password: "Contraseña", remember: "Mantener mi sesión iniciada", forgot: "¿Olvidaste tu contraseña?", submit: "Iniciar sesión", switchLead: "¿Eres nuevo en Basement?", switchAction: "Crear una cuenta" },
    signUp: { eyebrow: "Únete a la comunidad", title: "Crear cuenta", intro: "Guarda tus piezas favoritas y mantén cada proyecto en un solo lugar.", firstName: "Nombre", lastName: "Apellido", email: "Correo electrónico", password: "Crear contraseña", confirm: "Confirmar contraseña", marketing: "Envíenme nuevos lanzamientos, proyectos y ofertas.", terms: "Acepto los Términos de servicio y la Política de privacidad.", submit: "Crear cuenta", switchLead: "¿Ya tienes una cuenta?", switchAction: "Iniciar sesión" },
  },
} as const;

const fieldClass = "h-[50px] w-full rounded-sm border border-white/20 bg-[#090a0a] px-4 text-white outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/10 [@media(max-height:820px)]:h-[41px]";
const labelClass = "grid gap-2 text-[11px] font-bold tracking-[.06em] text-[#d6d7d3] uppercase [@media(max-height:820px)]:gap-1";

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
    window.localStorage.setItem("basement-locale", next);
    document.documentElement.setAttribute("lang", next);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return <main className={`relative min-h-svh overflow-x-hidden bg-ink text-[#f7f7f3] ${mode === "sign-in" ? "h-svh overflow-y-hidden max-[600px]:h-auto max-[600px]:overflow-y-auto" : ""}`}>
    <div aria-hidden="true" className="pointer-events-none fixed -top-[28vw] left-1/2 h-[55vw] w-[72vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(243,180,2,.16),rgba(243,180,2,.035)_38%,transparent_70%)] blur-xl" />
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,black_35%,transparent)]" />

    <header className="absolute top-0 left-1/2 z-20 flex h-[72px] w-[min(calc(100%_-_64px),1480px)] -translate-x-1/2 items-center justify-between max-[600px]:h-[58px] max-[600px]:w-[calc(100%_-_32px)]">
      <Link href="/" className="flex items-center gap-2.5 text-xs font-bold tracking-[.08em] text-[#b9bab6] uppercase transition hover:text-white max-[600px]:text-[9px]"><ArrowLeft className="text-brand" size={17} />{t.back}</Link>
      <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/70 p-1" role="group" aria-label={t.language}>
        {(["en", "es"] as const).map((item, index) => <span className="contents" key={item}>{index > 0 && <i className="not-italic text-white/30">/</i>}<button className={`h-7 min-w-8.5 cursor-pointer rounded-full border-0 text-[10px] font-extrabold ${locale === item ? "bg-brand text-black" : "bg-transparent text-white/45"}`} onClick={() => changeLocale(item)} aria-pressed={locale === item}>{item.toUpperCase()}</button></span>)}
      </div>
    </header>

    <section className="relative z-10 mx-auto flex min-h-svh w-[min(calc(100%_-_32px),500px)] flex-col items-center justify-center gap-3 pt-[72px] pb-7 [@media(max-height:820px)]:gap-0.5 [@media(max-height:820px)]:pt-[58px] [@media(max-height:820px)]:pb-3.5 max-[600px]:gap-1 max-[600px]:pt-[58px] max-[600px]:pb-5" aria-labelledby="auth-title">
      <Link href="/" className="block w-[clamp(235px,22vw,330px)] [@media(max-height:820px)]:w-[185px] max-[600px]:w-[205px]" aria-label="Basement Performance Products home">
        <Image className="h-auto w-full mix-blend-screen" src="/images/basement-auth-logo.png" alt="Basement Performance Products" width={1536} height={1024} priority />
      </Link>

      <div className="flex w-full flex-col gap-5 rounded-sm border border-white/12 bg-[linear-gradient(145deg,rgba(22,23,23,.93),rgba(8,9,9,.96))] p-[clamp(30px,3.2vw,38px)] shadow-[0_30px_90px_rgba(0,0,0,.55)] [@media(max-height:820px)]:gap-3 [@media(max-height:820px)]:px-7 [@media(max-height:820px)]:py-5 max-[600px]:px-5 max-[600px]:py-6">
        <div className="flex flex-col gap-3 [@media(max-height:820px)]:gap-2">
          <div className="flex flex-col gap-2 [@media(max-height:820px)]:gap-1">
            <p className="text-[10px] font-extrabold tracking-[.19em] text-brand uppercase">{content.eyebrow}</p>
            <h1 id="auth-title" className="font-display text-[clamp(40px,5vw,50px)] leading-[.98] font-bold tracking-[-.035em] uppercase [@media(max-height:820px)]:text-[40px]">{content.title}</h1>
          </div>
          <p className="max-w-[390px] text-[13px] leading-6 text-white/60 [@media(max-height:820px)]:text-xs">{content.intro}</p>
        </div>

        <form className="grid gap-4 [@media(max-height:820px)]:gap-2.5" onSubmit={handleSubmit}>
          {mode === "sign-up" && <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1 max-[600px]:gap-4">
            <label className={labelClass}><span>{t.signUp.firstName}</span><input className={fieldClass} name="firstName" type="text" autoComplete="given-name" required /></label>
            <label className={labelClass}><span>{t.signUp.lastName}</span><input className={fieldClass} name="lastName" type="text" autoComplete="family-name" required /></label>
          </div>}
          <label className={labelClass}><span>{content.email}</span><input className={fieldClass} name="email" type="email" autoComplete="email" required /></label>
          <label className={labelClass}><span>{content.password}</span><span className="relative block"><input className={`${fieldClass} pr-12`} name="password" type={passwordVisible ? "text" : "password"} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} required /><button type="button" className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 cursor-pointer place-items-center border-0 bg-transparent text-white/55" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? t.hide : t.show}>{passwordVisible ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
          {mode === "sign-up" && <label className={labelClass}><span>{t.signUp.confirm}</span><input className={fieldClass} name="confirmPassword" type={passwordVisible ? "text" : "password"} autoComplete="new-password" minLength={8} required /></label>}

          {mode === "sign-in" ? <div className="flex items-start justify-between gap-4 text-[11px] text-white/60">
            <label className="flex cursor-pointer items-start gap-2"><input className="size-4 accent-brand" type="checkbox" name="remember" /><span>{t.signIn.remember}</span></label>
            <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-brand">{t.signIn.forgot}</button>
          </div> : <div className="grid gap-3 text-[11px] leading-4 text-white/60">
            <label className="flex cursor-pointer items-start gap-2"><input className="size-4 shrink-0 accent-brand" type="checkbox" name="marketing" /><span>{t.signUp.marketing}</span></label>
            <label className="flex cursor-pointer items-start gap-2"><input className="size-4 shrink-0 accent-brand" type="checkbox" name="terms" required /><span>{t.signUp.terms}</span></label>
          </div>}

          <button className="flex h-[52px] w-full cursor-pointer items-center justify-between rounded-sm border border-brand bg-brand px-5 text-xs font-black tracking-[.08em] text-black uppercase transition hover:bg-transparent hover:text-brand [@media(max-height:820px)]:h-[43px]" type="submit">{content.submit}<ArrowRight size={19} /></button>
          {submitted && <p className="border-l-2 border-brand bg-brand/8 px-3 py-2.5 text-[11px] leading-4 text-white/75" role="status">{t.pending}</p>}
        </form>

        <div className="flex flex-col gap-3.5 border-t border-white/12 pt-4.5 [@media(max-height:820px)]:gap-2 [@media(max-height:820px)]:pt-3">
          <p className="text-center text-xs text-white/60">{content.switchLead} <Link className="text-brand underline underline-offset-3" href={switchHref}>{content.switchAction}</Link></p>
          <p className="text-center text-[9px] leading-4 text-white/40">{t.legal} <a className="text-brand underline underline-offset-3" href="#terms">{t.terms}</a> {t.and} <a className="text-brand underline underline-offset-3" href="#privacy">{t.privacy}</a>.</p>
        </div>
      </div>
    </section>
  </main>;
}
