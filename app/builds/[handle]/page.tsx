import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuildDetail } from "@/components/builds/BuildDetail";
import { getVehicleBuild } from "@/lib/home-content";
import { JsonLd } from "@/components/seo/JsonLd";
import { resolveStoreLocale } from "@/lib/commerce/locale";
import { buildGalleryJsonLd, privateMetadata, shareMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/builds/[handle]"> & {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { handle } = await params;
  const query = await searchParams;
  const locale = await resolveStoreLocale(query);
  const build = await getVehicleBuild(handle);
  if (!build) return { title: "Build not found", ...privateMetadata };
  const title = [build.meta, build.model, build.title].filter(Boolean).join(" ");
  const description =
    locale === "es"
      ? build.description || `Proyecto de la comunidad Basement: ${title}.`
      : build.description || title;
  return shareMetadata(
    {
      title,
      description,
      path: `/builds/${handle}`,
      image: build.src,
      imageAlt: title,
    },
    locale,
  );
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
