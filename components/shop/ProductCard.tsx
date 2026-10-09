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

function Spec({
  label,
  value,
  extra,
  title,
  align = "center",
}: {
  label: string;
  value: string;
  extra?: number;
  title?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${align === "center" ? "items-center text-center" : "items-start text-left"}`}>
      <strong className="flex max-w-full items-center gap-1.5 text-xs" title={title}>
        <span className="truncate">{value}</span>
        {extra ? (
          <span className="shrink-0 rounded-full bg-brand px-1.5 py-0.5 text-[8px] leading-none text-black" aria-label={`${extra} more`}>
            +{extra}
          </span>
        ) : null}
      </strong>
      <span className="text-[9px] uppercase text-foreground/45">{label}</span>
    </div>
  );
}

export function ProductCard({
  product,
  buildDisplay,
  onAdd,
  compact = false,
}: ProductCardProps) {
  const material = summarizeValues(product.material);
  const finish = summarizeValues(product.finish);

  if (compact) {
    return (
      <article className="group flex min-w-0 items-center gap-5 overflow-hidden rounded-2xl border border-foreground/10 bg-panel px-4 py-3 max-[900px]:gap-3 max-[900px]:px-3">
        <Link className="relative size-32 shrink-0 max-[900px]:size-24" href={`/products/${product.slug}`} aria-label={product.name}>
          <Image
            className="object-contain p-1.5 drop-shadow-[0_10px_10px_rgba(0,0,0,.16)] transition duration-500 group-hover:scale-[1.04]"
            src={product.image}
            alt={product.name}
            fill
            sizes="128px"
            style={{ objectPosition: product.objectPosition }}
            unoptimized={product.image.startsWith("https://cdn.shopify.com/")}
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link className={`${buildDisplay} truncate text-2xl leading-none transition hover:text-brand`} href={`/products/${product.slug}`}>
              {product.name}
            </Link>
            <p className="truncate text-xs uppercase text-foreground/55">{product.part}</p>
          </div>
          <p className="min-w-0 truncate text-sm text-foreground/70 max-[900px]:hidden" title={[material.title, product.compatibility, finish.title].filter(Boolean).join(" · ")}>
            <span className="text-foreground">{material.first}</span>
            {material.remaining > 0 ? <span className="text-foreground/45"> +{material.remaining}</span> : null}
            <span className="mx-2 text-foreground/25">·</span>
            <span>{product.compatibility || "—"}</span>
            <span className="mx-2 text-foreground/25">·</span>
            <span className="text-foreground">{finish.first}</span>
            {finish.remaining > 0 ? <span className="text-foreground/45"> +{finish.remaining}</span> : null}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <strong className="text-lg">{formatProductPrice(product)}</strong>
          <button
            className="grid size-8 cursor-pointer place-items-center rounded-full border border-foreground/15 transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => onAdd(product)}
            disabled={product.inventoryQuantity === 0}
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-panel">
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
        </div>
      </div>

      <div className="relative h-60 overflow-hidden max-[680px]:order-first max-[680px]:aspect-square max-[680px]:h-auto">
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

      <div className="grid grid-cols-3 items-center px-3 pb-4 max-[680px]:hidden">
        <div className="border-r border-foreground/10 py-1">
          <Spec label="Material" value={material.first} extra={material.remaining} title={material.title} />
        </div>
        <div className="border-r border-foreground/10 py-1">
          <Spec label="Fitment" value={product.compatibility || "—"} title={product.compatibility} />
        </div>
        <div className="py-1">
          <Spec label="Finish" value={finish.first} extra={finish.remaining} title={finish.title} />
        </div>
      </div>
    </article>
  );
}
