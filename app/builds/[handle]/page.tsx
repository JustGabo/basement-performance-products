import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuildDetail } from "@/components/builds/BuildDetail";
import { getVehicleBuild } from "@/lib/home-content";

export async function generateMetadata({ params }: PageProps<"/builds/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const build = await getVehicleBuild(handle);
  if (!build) return { title: "Build not found | Basement Performance Products" };
  return { title: `${build.meta} ${build.title} | Basement Performance Products`, description: build.description || `${build.meta} ${build.model} ${build.title}` };
}

export default async function BuildPage({ params }: PageProps<"/builds/[handle]">) {
  const { handle } = await params;
  const build = await getVehicleBuild(handle);
  if (!build) notFound();
  return <BuildDetail build={build} />;
}
