import { KeyRound, Save, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { updatePassword, updateProfile } from "@/app/account/actions";
import { createClient } from "@/lib/supabase/server";

const fieldClass = "h-12 w-full border border-foreground/18 bg-ink px-3 text-sm outline-none transition placeholder:text-foreground/30 focus:border-brand focus:ring-3 focus:ring-brand/10";
const labelClass = "flex flex-col gap-2 text-[10px] font-black tracking-[.06em] uppercase";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/sign-in");
  const { data: profile } = await supabase.from("profiles").select("first_name, last_name, phone, marketing_opt_in").eq("id", userId).maybeSingle();
  const email = typeof claimsData.claims.email === "string" ? claimsData.claims.email : "";

  return <section className="flex flex-col gap-8">
    <div className="flex flex-col gap-2"><p className="text-[10px] font-black tracking-[.18em] text-brand uppercase">Personal information</p><h1 className="font-display text-[clamp(48px,6vw,78px)] leading-[.9] font-bold tracking-[-.035em] uppercase">Profile & security</h1><p className="max-w-2xl text-sm leading-6 text-foreground/55">Keep your contact details current and protect your account.</p></div>
    <form action={updateProfile} className="flex flex-col gap-6 border border-foreground/15 bg-panel p-6 max-[600px]:p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center border border-brand/35 text-brand"><UserRound size={19} /></span><h2 className="font-display text-2xl font-bold uppercase">Account details</h2></div><div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1"><label className={labelClass}>First name<input className={fieldClass} defaultValue={profile?.first_name ?? ""} name="firstName" /></label><label className={labelClass}>Last name<input className={fieldClass} defaultValue={profile?.last_name ?? ""} name="lastName" /></label><label className={labelClass}>Email<input className={`${fieldClass} cursor-not-allowed opacity-55`} defaultValue={email} disabled type="email" /></label><label className={labelClass}>Phone<input className={fieldClass} defaultValue={profile?.phone ?? ""} name="phone" type="tel" /></label></div><label className="flex items-center gap-2 text-xs text-foreground/65"><input className="size-4 accent-brand" defaultChecked={profile?.marketing_opt_in ?? false} name="marketing" type="checkbox" />Send me new drops, builds and offers.</label><button className="flex min-h-12 w-fit cursor-pointer items-center gap-5 bg-brand px-6 text-[10px] font-black text-black uppercase" type="submit">Save changes<Save size={17} /></button></form>
    <form action={updatePassword} className="flex flex-col gap-6 border border-foreground/15 bg-panel p-6 max-[600px]:p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center border border-brand/35 text-brand"><KeyRound size={19} /></span><div><h2 className="font-display text-2xl font-bold uppercase">Change password</h2><p className="text-xs text-foreground/50">Use at least eight characters.</p></div></div><div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1"><label className={labelClass}>New password<input className={fieldClass} minLength={8} name="password" required type="password" /></label><label className={labelClass}>Confirm password<input className={fieldClass} minLength={8} name="confirmation" required type="password" /></label></div><button className="flex min-h-12 w-fit cursor-pointer items-center gap-5 border border-brand px-6 text-[10px] font-black text-brand uppercase transition hover:bg-brand hover:text-black" type="submit">Update password<KeyRound size={17} /></button></form>
  </section>;
}
