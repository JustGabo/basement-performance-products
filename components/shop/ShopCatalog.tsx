"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Heart,
  PackageSearch,
  Rows3,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import {
  BuildLayout,
  buildDisplay,
  buildShell,
} from "@/components/builds/BuildShell";
import { useCart } from "@/components/cart/CartProvider";
import { useFavorites } from "@/components/favorites/useFavorites";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatProductPrice, type StoreProduct } from "@/lib/commerce";

const productsPerPage = 8;
type SortOption = "newest" | "price-low" | "price-high" | "name";

function isShopifyImage(src: string) {
  return src.startsWith("https://cdn.shopify.com/");
}

export function ShopCatalog({
  products,
  initialQuery = "",
  focusSearch = false,
}: {
  products: StoreProduct[];
  initialQuery?: string;
  focusSearch?: boolean;
}) {
  const { addItem } = useCart();
  const { isSaved, toggleFavorite } = useFavorites("en");
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState<"all" | "in-stock">(
    "in-stock",
  );
  const [priceLimit, setPriceLimit] = useState<number | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [compact, setCompact] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    products.forEach((product) =>
      product.categories?.forEach((item) =>
        unique.set(item.handle, item.title),
      ),
    );
    return [...unique.entries()]
      .map(([handle, title]) => ({ handle, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [products]);
  const maximumPrice = useMemo(
    () =>
      Math.max(
        0,
        ...products.map(
          (product) => product.displayPriceCents ?? product.priceCents,
        ),
      ),
    [products],
  );
  const effectivePriceLimit = priceLimit ?? maximumPrice;

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const searchText =
        `${product.name} ${product.part} ${product.description ?? ""} ${product.sku ?? ""} ${product.compatibility ?? ""}`.toLowerCase();
      const matchesCategory =
        category === "all" ||
        product.categories?.some((item) => item.handle === category);
      const matchesAvailability =
        availability === "all" || product.inventoryQuantity !== 0;
      const matchesPrice =
        (product.displayPriceCents ?? product.priceCents) <=
        effectivePriceLimit;
      return (
        (!deferredQuery || searchText.includes(deferredQuery)) &&
        matchesCategory &&
        matchesAvailability &&
        matchesPrice
      );
    });
    if (sort === "price-low")
      return [...filtered].sort(
        (a, b) =>
          (a.displayPriceCents ?? a.priceCents) -
          (b.displayPriceCents ?? b.priceCents),
      );
    if (sort === "price-high")
      return [...filtered].sort(
        (a, b) =>
          (b.displayPriceCents ?? b.priceCents) -
          (a.displayPriceCents ?? a.priceCents),
      );
    if (sort === "name")
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [
    availability,
    category,
    deferredQuery,
    effectivePriceLimit,
    products,
    sort,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage,
  );
  const hasFilters = Boolean(
    query ||
    category !== "all" ||
    availability !== "in-stock" ||
    priceLimit !== null,
  );

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setAvailability("in-stock");
    setPriceLimit(null);
    setPage(1);
  };
  const changePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    document
      .querySelector("#catalog-grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const categoryCount = (handle: string) =>
    products.filter((product) =>
      product.categories?.some((item) => item.handle === handle),
    ).length;

  const filters = (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <span className={`${buildDisplay} text-2xl`}>Filters</span>
        {hasFilters && (
          <button
            className="cursor-pointer text-[9px] text-brand underline underline-offset-4"
            type="button"
            onClick={resetFilters}
          >
            Clear all
          </button>
        )}
      </div>
      <label
        className="flex min-h-12 items-center gap-3 border border-foreground/20 bg-panel px-3 focus-within:border-brand"
        htmlFor="filter-search"
      >
        <Search size={16} className="text-foreground/40" />
        <input
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-foreground/30"
          id="filter-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search..."
          autoFocus={focusSearch}
        />
        {query && (
          <button
            className="cursor-pointer text-foreground/40 hover:text-brand"
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </label>
      <fieldset className="flex flex-col gap-3">
        <legend className="pb-3 text-[9px] font-black tracking-[.14em] text-foreground/45 uppercase">
          Collections
        </legend>
        <button
          className={`min-h-10 cursor-pointer border px-3 text-left text-[10px] font-bold uppercase transition ${category === "all" ? "border-brand bg-brand text-black" : "border-foreground/20 hover:border-brand"}`}
          type="button"
          onClick={() => {
            setCategory("all");
            setPage(1);
          }}
        >
          All parts{" "}
          <span className="float-right opacity-55">{products.length}</span>
        </button>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              className={`min-h-9 cursor-pointer border px-3 text-[9px] font-bold uppercase transition ${category === item.handle ? "border-brand bg-brand text-black" : "border-foreground/20 text-foreground/60 hover:border-brand hover:text-brand"}`}
              type="button"
              onClick={() => {
                setCategory(item.handle);
                setPage(1);
              }}
              key={item.handle}
            >
              {item.title} · {categoryCount(item.handle)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-3 border-t border-foreground/15 pt-6">
        <legend className="pb-3 text-[9px] font-black tracking-[.14em] text-foreground/45 uppercase">
          Availability
        </legend>
        <label className="flex cursor-pointer items-center gap-3 text-xs">
          <input
            className="size-4 accent-brand"
            type="radio"
            checked={availability === "in-stock"}
            onChange={() => {
              setAvailability("in-stock");
              setPage(1);
            }}
          />
          In stock
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-xs">
          <input
            className="size-4 accent-brand"
            type="radio"
            checked={availability === "all"}
            onChange={() => {
              setAvailability("all");
              setPage(1);
            }}
          />
          Show all inventory
        </label>
      </fieldset>
      <fieldset className="flex flex-col gap-4 border-t border-foreground/15 pt-6">
        <legend className="pb-3 text-[9px] font-black tracking-[.14em] text-foreground/45 uppercase">
          Maximum price
        </legend>
        <input
          className="w-full cursor-pointer accent-brand"
          type="range"
          min="0"
          max={Math.max(maximumPrice, 1)}
          step="100"
          value={effectivePriceLimit}
          onChange={(event) => {
            setPriceLimit(Number(event.target.value));
            setPage(1);
          }}
        />
        <div className="flex justify-between gap-3 text-[9px] text-foreground/40">
          <span>$0</span>
          <span className="font-black text-brand">
            ${Math.round(effectivePriceLimit / 100).toLocaleString()}
          </span>
        </div>
      </fieldset>
    </div>
  );

  return (
    <BuildLayout backHref="/" backLabel="Back home">
      <section
        className={`${buildShell} grid grid-cols-[250px_minmax(0,1fr)] items-start gap-8 py-12 max-[900px]:grid-cols-1 max-[700px]:py-7`}
      >
        <aside
          className="sticky top-28 hidden min-[901px]:block"
          aria-label="Product filters"
        >
          {filters}
        </aside>
        <div className="flex min-w-0 flex-col gap-7">
          <header className="flex items-center justify-between gap-5">
            <div className="flex items-baseline gap-2">
              <h1
                className={`${buildDisplay} text-[clamp(42px,2vw,72px)] leading-none`}
              >
                In stock
              </h1>
              <span className="text-xl text-foreground/35">
                ({filteredProducts.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="grid size-11 cursor-pointer place-items-center rounded-full border border-foreground/20 min-[901px]:hidden"
                    type="button"
                    aria-label="Open filters"
                  >
                    <SlidersHorizontal size={17} />
                  </button>
                </SheetTrigger>
                <SheetContent
                  className="w-[min(88vw,360px)] border-foreground/20 bg-ink p-6 text-foreground"
                  side="left"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Product filters</SheetTitle>
                  </SheetHeader>
                  {filters}
                </SheetContent>
              </Sheet>
              <label className="flex min-h-11 items-center gap-2 rounded-full border border-foreground/20 bg-panel px-4 text-[9px] font-black uppercase">
                <select
                  className="cursor-pointer bg-transparent outline-none"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as SortOption);
                    setPage(1);
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: low</option>
                  <option value="price-high">Price: high</option>
                  <option value="name">Name: A–Z</option>
                </select>
              </label>
              <div className="flex items-center gap-1 rounded-full border border-foreground/20 p-1 max-[560px]:hidden">
                <button
                  className={`grid size-8 cursor-pointer place-items-center rounded-full ${!compact ? "bg-brand text-black" : "text-foreground/45"}`}
                  type="button"
                  onClick={() => setCompact(false)}
                  aria-label="Grid view"
                >
                  <Grid2X2 size={15} />
                </button>
                <button
                  className={`grid size-8 cursor-pointer place-items-center rounded-full ${compact ? "bg-brand text-black" : "text-foreground/45"}`}
                  type="button"
                  onClick={() => setCompact(true)}
                  aria-label="List view"
                >
                  <Rows3 size={16} />
                </button>
              </div>
            </div>
          </header>

          <div className="scroll-mt-28" id="catalog-grid">
            {visibleProducts.length ? (
              <div
                className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-2 max-[680px]:grid-cols-1"}`}
              >
                {visibleProducts.map((product) => {
                  return (
                    <article
                      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-panel ${compact ? "min-[681px]:grid min-[681px]:grid-cols-[280px_1fr]" : ""}`}
                      key={product.id}
                    >
                      <div className="flex items-start justify-between gap-4 p-5 pb-0">
                        <div className="flex min-w-0 flex-col gap-1">
                          <Link
                            className={`${buildDisplay} truncate text-2xl transition hover:text-brand`}
                            href={`/products/${product.slug}`}
                          >
                            {product.name}
                          </Link>
                          <p className="truncate text-[9px] tracking-widest text-foreground/45 uppercase">
                            {product.part}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <strong className="mr-1 text-xl font-semibold tracking-wider">
                            {formatProductPrice(product)}
                          </strong>
                          <button
                            className="grid size-9 cursor-pointer place-items-center rounded-full border border-foreground/20 transition enabled:hover:border-brand enabled:hover:text-brand disabled:cursor-not-allowed disabled:opacity-35"
                            type="button"
                            onClick={() => addItem(product)}
                            disabled={product.inventoryQuantity === 0}
                            aria-label={`Add ${product.name} to cart`}
                          >
                            <ShoppingCart size={16} />
                          </button>
                          <button
                            className={`grid size-9 cursor-pointer place-items-center rounded-full border border-foreground/20 transition hover:border-brand hover:text-brand ${isSaved(product.id) ? "border-brand text-brand" : ""}`}
                            type="button"
                            onClick={() => void toggleFavorite(product)}
                            aria-label={`Save ${product.name}`}
                          >
                            <Heart
                              className={
                                isSaved(product.id) ? "fill-current" : ""
                              }
                              size={16}
                            />
                          </button>
                        </div>
                      </div>
                      <div
                        className={`relative h-64 overflow-hidden max-[500px]:h-56 ${compact ? "min-[681px]:row-start-1 min-[681px]:row-end-3 min-[681px]:h-60" : ""}`}
                      >
                        <Link
                          className="absolute inset-0"
                          href={`/products/${product.slug}`}
                          aria-label={product.name}
                        >
                          <Image
                            className="object-contain p-6 drop-shadow-[0_14px_14px_rgba(0,0,0,.2)] transition duration-500 group-hover:scale-[1.035] max-[500px]:p-5"
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes={
                              compact
                                ? "280px"
                                : "(max-width: 680px) 100vw, 42vw"
                            }
                            style={{ objectPosition: product.objectPosition }}
                            unoptimized={isShopifyImage(product.image)}
                          />
                        </Link>
                      </div>
                      <div
                        className={`grid grid-cols-3 items-center px-3 pb-4 ${compact ? "min-[681px]:self-end" : ""}`}
                      >
                        <div className="flex min-w-0 flex-col items-center gap-1 px-3 py-2 text-center">
                          <strong className="truncate text-[10px]">
                            {product.material || "Carbon fiber"}
                          </strong>
                          <span className="text-[8px] text-foreground/40 uppercase">
                            Material
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-col items-center gap-1 border-x border-foreground/12 px-3 py-2 text-center">
                          <strong className="truncate text-[10px]">
                            {product.compatibility || "Universal"}
                          </strong>
                          <span className="text-[8px] text-foreground/40 uppercase">
                            Fitment
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-col items-center gap-1 px-3 py-2 text-center">
                          <strong className="truncate text-[10px]">
                            {product.finish || "Gloss"}
                          </strong>
                          <span className="text-[8px] text-foreground/40 uppercase">
                            Finish
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-96 flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-foreground/20 bg-panel px-6 text-center">
                <span className="grid size-16 place-items-center rounded-full border border-brand/35 text-brand">
                  <PackageSearch size={27} />
                </span>
                <div className="flex flex-col gap-2">
                  <h2 className={`${buildDisplay} text-3xl`}>
                    No products found.
                  </h2>
                  <p className="text-xs text-foreground/50">
                    Try another search or clear the active filters.
                  </p>
                </div>
                <button
                  className="min-h-11 cursor-pointer bg-brand px-6 text-[10px] font-black text-black uppercase"
                  type="button"
                  onClick={resetFilters}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {filteredProducts.length > productsPerPage && (
            <nav
              className="flex items-center justify-center gap-2 pt-3"
              aria-label="Product pages"
            >
              <button
                className="grid size-10 place-items-center rounded-full text-foreground/65 enabled:cursor-pointer enabled:hover:bg-foreground/10 disabled:opacity-20"
                type="button"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={19} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (item) => (
                  <button
                    className={`grid size-11 cursor-pointer place-items-center rounded-full text-sm font-black ${item === currentPage ? "bg-brand text-black" : "text-foreground/65 hover:bg-foreground/10"}`}
                    type="button"
                    onClick={() => changePage(item)}
                    aria-current={item === currentPage ? "page" : undefined}
                    key={item}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                className="grid size-10 place-items-center rounded-full text-foreground/65 enabled:cursor-pointer enabled:hover:bg-foreground/10 disabled:opacity-20"
                type="button"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={19} />
              </button>
            </nav>
          )}
        </div>
      </section>
    </BuildLayout>
  );
}
