import "server-only";

import { storefrontRequest } from "@/lib/shopify/storefront";

export type HeroSlide = { id: string; src: string; alt: string; objectPosition: string };
export type BuildImage = { src: string; alt: string };
export type BuildGalleryItem = {
  id: string;
  handle: string;
  src: string;
  images: BuildImage[];
  title: string;
  meta: string;
  model: string;
  description: string;
  href: string;
  featured: boolean;
};

export const fallbackHeroSlides: HeroSlide[] = [
  { id: "fallback-blue", src: "/images/gallery-blue-civic.png", alt: "Blue modified Civic displayed with its hood open", objectPosition: "center" },
  { id: "fallback-white-open", src: "/images/gallery-white-open.png", alt: "White modified sedan displayed with its hood open", objectPosition: "center" },
  { id: "fallback-white-closed", src: "/images/gallery-white-closed.png", alt: "White lowered sedan in a covered parking structure", objectPosition: "center" },
];

function createFallbackBuild(handle: string, src: string, title: string, meta: string, model: string): BuildGalleryItem {
  return {
    id: `fallback-${handle}`,
    handle,
    src,
    images: [{ src, alt: `${meta} ${model} with ${title}` }],
    title,
    meta,
    model,
    description: `${meta} ${model} community build featuring a custom ${title.toLowerCase()}.`,
    href: `/builds/${handle}`,
    featured: true,
  };
}

export const fallbackBuildGallery: BuildGalleryItem[] = [
  createFallbackBuild("bmw-front-lip", "/images/build-bmw-front-lip-studio.png", "Front Lip", "BMW", "3 Series"),
  createFallbackBuild("mazda-front-splitter", "/images/build-mazda-front-splitter-studio.png", "Front Splitter", "Mazda", "Demio"),
  createFallbackBuild("toyota-front-side-lips", "/images/build-toyota-front-side-lips-studio.png", "Front & Side Lips", "Toyota", "Altezza"),
  createFallbackBuild("honda-front-lip-js-racing", "/images/build-honda-js-racing-lip-studio.png", "Front Lip JS Racing", "Honda", "Civic"),
];

type ShopifyImage = { url: string; altText: string | null };
type MetaobjectField = {
  key: string;
  value: string | null;
  reference: { image?: ShopifyImage | null } | null;
  references?: { nodes: Array<{ image?: ShopifyImage | null }> } | null;
};
type MetaobjectNode = { id: string; handle: string; fields: MetaobjectField[] };
type MetaobjectsQuery = { entries: { nodes: MetaobjectNode[] } };

function fieldsByKey(node: MetaobjectNode) {
  return new Map(node.fields.map((field) => [field.key, field]));
}

function isEnabled(value: string | null | undefined) {
  return value !== "false";
}

function sortOrder(node: MetaobjectNode) {
  const parsed = Number(fieldsByKey(node).get("sort_order")?.value);
  return Number.isFinite(parsed) ? parsed : 999;
}

const mediaFields = `
  fields {
    key
    value
    reference { ... on MediaImage { image { url altText } } }
    references(first: 20) {
      nodes { ... on MediaImage { image { url altText } } }
    }
  }
`;

async function getHeroSlides() {
  if (process.env.COMMERCE_PROVIDER !== "shopify") return fallbackHeroSlides;
  try {
    const data = await storefrontRequest<MetaobjectsQuery>(`
      query HomepageHero($type: String!) {
        entries: metaobjects(type: $type, first: 20) {
          nodes { id handle ${mediaFields} }
        }
      }
    `, { type: "homepage_hero_slide" }, { revalidate: 120 });
    return data.entries.nodes
      .filter((node) => isEnabled(fieldsByKey(node).get("active")?.value))
      .sort((left, right) => sortOrder(left) - sortOrder(right))
      .flatMap((node) => {
        const fields = fieldsByKey(node);
        const image = fields.get("image")?.reference?.image;
        if (!image?.url) return [];
        return [{ id: node.id, src: image.url, alt: fields.get("alt_text")?.value || image.altText || "Basement Performance Products featured build", objectPosition: fields.get("object_position")?.value || "center" }];
      })
      .slice(0, 10);
  } catch {
    return [];
  }
}

export async function getVehicleBuilds(): Promise<BuildGalleryItem[]> {
  if (process.env.COMMERCE_PROVIDER !== "shopify") return fallbackBuildGallery;
  try {
    const data = await storefrontRequest<MetaobjectsQuery>(`
      query VehicleBuilds($type: String!) {
        entries: metaobjects(type: $type, first: 50) {
          nodes { id handle ${mediaFields} }
        }
      }
    `, { type: "vehicle_build" }, { revalidate: 120 });
    return data.entries.nodes
      .filter((node) => isEnabled(fieldsByKey(node).get("active")?.value))
      .sort((left, right) => sortOrder(left) - sortOrder(right))
      .flatMap((node) => {
        const fields = fieldsByKey(node);
        const cover = fields.get("cover_image")?.reference?.image;
        const modification = fields.get("modification")?.value;
        const brand = fields.get("brand")?.value;
        if (!cover?.url || !modification || !brand) return [];
        const gallery = fields.get("gallery_images")?.references?.nodes.flatMap((reference) => reference.image?.url ? [{ src: reference.image.url, alt: reference.image.altText || `${brand} ${modification}` }] : []) ?? [];
        const images = [{ src: cover.url, alt: cover.altText || `${brand} ${modification}` }, ...gallery.filter((image) => image.src !== cover.url)];
        return [{
          id: node.id,
          handle: node.handle,
          src: cover.url,
          images,
          title: modification,
          meta: brand,
          model: fields.get("model")?.value || "",
          description: fields.get("description")?.value || "",
          href: `/builds/${node.handle}`,
          featured: isEnabled(fields.get("featured")?.value),
        }];
      });
  } catch {
    return [];
  }
}

export async function getVehicleBuild(handle: string) {
  const builds = await getVehicleBuilds();
  return builds.find((build) => build.handle === handle) ?? null;
}

export async function getHomepageContent(): Promise<{ heroSlides: HeroSlide[]; buildGallery: BuildGalleryItem[] }> {
  const [heroSlides, builds] = await Promise.all([getHeroSlides(), getVehicleBuilds()]);
  const featuredBuilds = builds.filter((build) => build.featured);
  return { heroSlides, buildGallery: (featuredBuilds.length ? featuredBuilds : builds).slice(0, 4) };
}
