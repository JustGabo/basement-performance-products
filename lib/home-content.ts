import "server-only";

import { storefrontRequest } from "@/lib/shopify/storefront";

export type HeroSlide = {
  id: string;
  src: string;
  alt: string;
  objectPosition: string;
};

export type BuildGalleryItem = {
  id: string;
  src: string;
  title: string;
  meta: string;
  href: string;
};

export const fallbackHeroSlides: HeroSlide[] = [
  { id: "fallback-blue", src: "/images/gallery-blue-civic.png", alt: "Blue modified Civic displayed with its hood open", objectPosition: "center" },
  { id: "fallback-white-open", src: "/images/gallery-white-open.png", alt: "White modified sedan displayed with its hood open", objectPosition: "center" },
  { id: "fallback-white-closed", src: "/images/gallery-white-closed.png", alt: "White lowered sedan in a covered parking structure", objectPosition: "center" },
];

export const fallbackBuildGallery: BuildGalleryItem[] = [
  { id: "fallback-bmw", src: "/images/build-bmw-front-lip-studio.png", title: "Front Lip", meta: "BMW", href: "#stories" },
  { id: "fallback-mazda", src: "/images/build-mazda-front-splitter-studio.png", title: "Front Splitter", meta: "Mazda", href: "#stories" },
  { id: "fallback-toyota", src: "/images/build-toyota-front-side-lips-studio.png", title: "Front & Side Lips", meta: "Toyota", href: "#stories" },
  { id: "fallback-honda", src: "/images/build-honda-js-racing-lip-studio.png", title: "Front Lip JS Racing", meta: "Honda", href: "#stories" },
];

type MetaobjectField = {
  key: string;
  value: string | null;
  reference: {
    image?: { url: string; altText: string | null } | null;
  } | null;
};

type MetaobjectNode = {
  id: string;
  handle: string;
  fields: MetaobjectField[];
};

type HomepageContentQuery = {
  heroSlides: { nodes: MetaobjectNode[] };
  featuredBuilds: { nodes: MetaobjectNode[] };
};

function fieldsByKey(node: MetaobjectNode) {
  return new Map(node.fields.map((field) => [field.key, field]));
}

function isEnabled(value: string | null | undefined) {
  return value !== "false";
}

function sortOrder(node: MetaobjectNode) {
  const value = fieldsByKey(node).get("sort_order")?.value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 999;
}

export async function getHomepageContent(): Promise<{ heroSlides: HeroSlide[]; buildGallery: BuildGalleryItem[] }> {
  if (process.env.COMMERCE_PROVIDER !== "shopify") {
    return { heroSlides: fallbackHeroSlides, buildGallery: fallbackBuildGallery };
  }

  try {
    const data = await storefrontRequest<HomepageContentQuery>(`
      query HomepageContent($heroType: String!, $buildType: String!) {
        heroSlides: metaobjects(type: $heroType, first: 20) {
          nodes {
            id
            handle
            fields {
              key
              value
              reference {
                ... on MediaImage { image { url altText } }
              }
            }
          }
        }
        featuredBuilds: metaobjects(type: $buildType, first: 20) {
          nodes {
            id
            handle
            fields {
              key
              value
              reference {
                ... on MediaImage { image { url altText } }
              }
            }
          }
        }
      }
    `, { heroType: "homepage_hero_slide", buildType: "featured_build" });

    const heroSlides = data.heroSlides.nodes
      .filter((node) => isEnabled(fieldsByKey(node).get("active")?.value))
      .sort((left, right) => sortOrder(left) - sortOrder(right))
      .flatMap((node) => {
        const fields = fieldsByKey(node);
        const image = fields.get("image")?.reference?.image;
        if (!image?.url) return [];
        return [{
          id: node.id,
          src: image.url,
          alt: fields.get("alt_text")?.value || image.altText || "Basement Performance Products featured build",
          objectPosition: fields.get("object_position")?.value || "center",
        }];
      })
      .slice(0, 10);

    const buildGallery = data.featuredBuilds.nodes
      .filter((node) => isEnabled(fieldsByKey(node).get("active")?.value))
      .sort((left, right) => sortOrder(left) - sortOrder(right))
      .flatMap((node) => {
        const fields = fieldsByKey(node);
        const image = fields.get("image")?.reference?.image;
        const title = fields.get("modification")?.value;
        if (!image?.url || !title) return [];
        return [{
          id: node.id,
          src: image.url,
          title,
          meta: fields.get("brand")?.value || "Community build",
          href: fields.get("link")?.value || "#stories",
        }];
      })
      .slice(0, 12);

    return {
      heroSlides: heroSlides.length ? heroSlides : fallbackHeroSlides,
      buildGallery: buildGallery.length ? buildGallery : fallbackBuildGallery,
    };
  } catch {
    return { heroSlides: fallbackHeroSlides, buildGallery: fallbackBuildGallery };
  }
}
