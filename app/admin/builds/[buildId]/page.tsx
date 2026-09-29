import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BuildForm, type EditableBuild } from "@/components/admin/BuildForm";
import { requireAdmin } from "@/lib/admin/auth";

export default async function EditBuildPage({ params, searchParams }: { params: Promise<{ buildId: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ buildId }, queryParams] = await Promise.all([params, searchParams]);
  const { admin } = await requireAdmin();
  const { data } = await admin.from("builds").select("*, build_images(id, image_url, alt_en)").eq("id", buildId).maybeSingle();
  if (!data) notFound();
  const build = data as EditableBuild;
  return <section className="flex flex-col gap-7"><AdminPageHeader eyebrow="Gallery editor" title={`${build.vehicle_brand} ${build.vehicle_model ?? ""}`} description={`Editing “${build.modification_en}”.`} action={<Link className="flex items-center gap-2 text-[9px] font-black text-foreground/50 uppercase hover:text-brand" href="/admin/builds"><ArrowLeft size={16} />Builds</Link>} /><AdminFeedback error={queryParams.error} saved={queryParams.saved} /><BuildForm build={build} /></section>;
}
