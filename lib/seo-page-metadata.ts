import type { Metadata } from "next";
import { resolveStoreLocale } from "@/lib/commerce/locale";
import { publicSeoCopy, type PublicSeoPage } from "@/lib/seo-i18n";
import { shareMetadata } from "@/lib/seo";

export async function generatePublicPageMetadata(
  page: PublicSeoPage,
  path: string,
  searchParams?: Promise<Record<string, string | string[] | undefined>>,
): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const locale = await resolveStoreLocale(params);
  const copy = publicSeoCopy[page][locale];
  return shareMetadata(
    {
      title: copy.title,
      description: copy.description,
      path,
      absoluteTitle: copy.absoluteTitle,
    },
    locale,
  );
}
