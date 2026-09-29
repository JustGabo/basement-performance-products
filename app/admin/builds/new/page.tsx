import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BuildForm } from "@/components/admin/BuildForm";

export default async function NewBuildPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <section className="flex flex-col gap-7"><AdminPageHeader eyebrow="Gallery editor" title="New build" description="Add a vehicle project and its bilingual modification story." action={<Link className="flex items-center gap-2 text-[9px] font-black text-foreground/50 uppercase hover:text-brand" href="/admin/builds"><ArrowLeft size={16} />Builds</Link>} /><AdminFeedback error={params.error} /><BuildForm /></section>;
}
