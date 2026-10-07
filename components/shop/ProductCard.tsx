"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatProductPrice, type StoreProduct } from "@/lib/commerce";

type ProductCardProps = {
  product: StoreProduct;
  buildDisplay: string;
  isSaved: (id: string) => boolean;
  onAdd: (product: StoreProduct) => void;
  onToggleFavorite: (product: StoreProduct) => void | Promise<void>;
  compact?: boolean;
};

function summarizeValues(value?: string[] | string) {
  const values = (Array.isArray(value) ? value : value ? [value] : [])
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    first: values[0] ?? "—",
    remaining: Math.max(0, values.length - 1),
    title: values.join(", ") || undefined,
  };
}

export function ProductCard({
  product,
  buildDisplay,
  onAdd,
  compact = false,
}: ProductCardProps) {
  const material = summarizeValues(product.material);
  const finish = summarizeValues(product.finish);

  return (
    <article
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-panel ${
        compact ? "min-[681px]:grid min-[681px]:grid-cols-[280px_1fr]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4 p-5 pb-0 max-[680px]:flex-1 max-[680px]:flex-col max-[680px]:gap-3 max-[680px]:p-3 max-[680px]:pt-2">
        <div className="flex min-w-0 flex-col gap-1 max-[680px]:w-full">
          <Link
            className={`${buildDisplay} truncate text-2xl transition hover:text-brand max-[680px]:text-lg`}
            href={`/products/${product.slug}`}
          >
            {product.name}
          </Link>
          <p className="truncate text-[10px] uppercase text-foreground/55">
            {product.part}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 max-[680px]:mt-auto max-[680px]:w-full max-[680px]:justify-between">
          <strong className="text-lg max-[680px]:text-base">
            {formatProductPrice(product)}
          </strong>
          <button
            className="grid size-8 cursor-pointer place-items-center rounded-full border border-foreground/15 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => onAdd(product)}
            disabled={product.inventoryQuantity === 0}
          >
            <ShoppingCart size={14} />
          </button>
          {/* <button
            className={`grid size-8 cursor-pointer place-items-center rounded-full border transition hover:border-brand hover:text-brand max-[680px]:hidden ${
              saved ? "border-brand text-brand" : "border-foreground/15"
            }`}
            type="button"
            aria-label={`${saved ? "Remove" : "Save"} ${product.name}`}
            onClick={() => void onToggleFavorite(product)}
          >
            <Heart className={saved ? "fill-current" : ""} size={14} />
          </button> */}
        </div>
      </div>

      <div
        className={`relative h-60 overflow-hidden max-[680px]:order-first max-[680px]:aspect-square max-[680px]:h-auto ${
          compact ? "min-[681px]:h-full" : ""
        }`}
      >
        {/* <button
          className={`absolute right-2 top-2 z-10 hidden size-8 cursor-pointer place-items-center rounded-full border bg-panel/80 backdrop-blur transition hover:border-brand hover:text-brand max-[680px]:grid ${
            saved ? "border-brand text-brand" : "border-foreground/15"
          }`}
          type="button"
          aria-label={`${saved ? "Remove" : "Save"} ${product.name}`}
          onClick={() => void onToggleFavorite(product)}
        >
          <Heart className={saved ? "fill-current" : ""} size={14} />
        </button> */}
        <Link
          className="absolute inset-0"
          href={`/products/${product.slug}`}
          aria-label={product.name}
        >
          <Image
            className="object-contain p-8 drop-shadow-[0_18px_18px_rgba(0,0,0,.18)] transition duration-500 group-hover:scale-[1.025] max-[680px]:p-4"
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 680px) 50vw, 25vw"
            style={{ objectPosition: product.objectPosition }}
            unoptimized={product.image.startsWith("https://cdn.shopify.com/")}
          />
        </Link>
      </div>

      <div
        className={`grid grid-cols-3 items-center px-3 pb-4 max-[680px]:hidden ${
          compact ? "min-[681px]:col-span-2" : ""
        }`}
      >
        <div className="flex flex-col items-center gap-1 border-r border-foreground/10 py-1 text-center">
          <strong className="flex items-center gap-1.5 text-xs" title={material.title}>
            <span>{material.first}</span>
            {material.remaining > 0 && (
              <span className="rounded-full bg-brand px-1.5 py-0.5 text-[8px] leading-none text-black" aria-label={`${material.remaining} more materials`}>
                +{material.remaining}
              </span>
            )}
          </strong>
          <span className="text-[9px] uppercase text-foreground/45">Material</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-r border-foreground/10 py-1 text-center">
          <strong className="text-xs">{product.compatibility || "—"}</strong>
          <span className="text-[9px] uppercase text-foreground/45">Fitment</span>
        </div>
        <div className="flex flex-col items-center gap-1 py-1 text-center">
          <strong className="flex items-center gap-1.5 text-xs" title={finish.title}>
            <span>{finish.first}</span>
            {finish.remaining > 0 && (
              <span className="rounded-full bg-brand px-1.5 py-0.5 text-[8px] leading-none text-black" aria-label={`${finish.remaining} more finishes`}>
                +{finish.remaining}
              </span>
            )}
          </strong>
          <span className="text-[9px] uppercase text-foreground/45">Finish</span>
        </div>
      </div>
    </article>
  );
}
