import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuildDetail } from "@/components/builds/BuildDetail";
import { getVehicleBuild } from "@/lib/home-content";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildGalleryJsonLd, privateMetadata, shareMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/builds/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const build = await getVehicleBuild(handle);
  if (!build) return { title: "Build not found", ...privateMetadata };
  const title = [build.meta, build.model, build.title].filter(Boolean).join(" ");
  return shareMetadata({
    title,
    description: build.description || title,
    path: `/builds/${handle}`,
    image: build.src,
    imageAlt: title,
  });
}

export default async function BuildPage({ params }: PageProps<"/builds/[handle]">) {
  const { handle } = await params;
  const build = await getVehicleBuild(handle);
  if (!build) notFound();
  const title = [build.meta, build.model, build.title].filter(Boolean).join(" ");
  return (
    <>
      <JsonLd
        data={buildGalleryJsonLd({
          title,
          description: build.description || title,
          path: `/builds/${handle}`,
          image: build.src,
        })}
      />
      <BuildDetail build={build} />
    </>
  );
}
