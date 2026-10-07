"use client";

import {
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  PackageSearch,
  Rows3,
  Search,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/shop/ProductCard";
import type { StoreProduct } from "@/lib/commerce";

const productsPerPage = 8;
type SortOption = "newest" | "price-low" | "price-high" | "name";

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
  const [partType, setPartType] = useState("all");
  const [vehicleMake, setVehicleMake] = useState("all");
  const [availability, setAvailability] = useState<"all" | "in-stock">(
    "in-stock",
  );
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [compact, setCompact] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const partTypes = useMemo(
    () =>
      [...new Set(products.map((product) => product.productType).filter((value): value is string => Boolean(value)))]
        .sort((a, b) => a.localeCompare(b)),
    [products],
  );
  const vehicleMakes = useMemo(
    () =>
      [...new Set(products.flatMap((product) => product.vehicleMakes ?? []))]
        .sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const searchText =
        `${product.name} ${product.part} ${product.productType ?? ""} ${(product.vehicleMakes ?? []).join(" ")} ${product.description ?? ""} ${product.sku ?? ""} ${product.compatibility ?? ""}`.toLowerCase();
      const matchesPartType =
        partType === "all" || product.productType === partType;
      const matchesVehicleMake =
        vehicleMake === "all" || product.vehicleMakes?.includes(vehicleMake);
      const matchesAvailability =
        availability === "all" || product.inventoryQuantity !== 0;
      return (
        (!deferredQuery || searchText.includes(deferredQuery)) &&
        matchesPartType &&
        matchesVehicleMake &&
        matchesAvailability
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
    deferredQuery,
    partType,
    products,
    sort,
    vehicleMake,
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
    partType !== "all" ||
    vehicleMake !== "all" ||
    availability !== "in-stock",
  );

  const resetFilters = () => {
    setQuery("");
    setPartType("all");
    setVehicleMake("all");
    setAvailability("in-stock");
    setPage(1);
  };
  const changePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    document
      .querySelector("#catalog-grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const partTypeCount = (value: string) =>
    products.filter((product) => product.productType === value).length;
  const vehicleMakeCount = (value: string) =>
    products.filter((product) => product.vehicleMakes?.includes(value)).length;

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
          className="min-w-0 flex-1 rounded-md bg-transparent text-base outline-none placeholder:text-foreground/30"
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
          Part type
        </legend>
        <button
          className={`min-h-10 cursor-pointer border px-3 text-left text-[10px] font-bold uppercase transition ${partType === "all" ? "border-brand bg-brand text-black" : "border-foreground/20 hover:border-brand"}`}
          type="button"
          onClick={() => {
            setPartType("all");
            setPage(1);
          }}
        >
          All parts{" "}
          <span className="float-right opacity-55">{products.length}</span>
        </button>
        <div className="flex flex-wrap gap-2">
          {partTypes.map((item) => (
            <button
              className={`min-h-9 cursor-pointer border px-3 text-[9px] font-bold uppercase transition ${partType === item ? "border-brand bg-brand text-black" : "border-foreground/20 text-foreground/60 hover:border-brand hover:text-brand"}`}
              type="button"
              onClick={() => {
                setPartType(item);
                setPage(1);
              }}
              key={item}
            >
              {item} · {partTypeCount(item)}
            </button>
          ))}
        </div>
      </fieldset>
      {vehicleMakes.length > 0 && (
        <fieldset className="flex flex-col gap-3 border-t border-foreground/15 pt-6">
          <legend className="pb-3 text-[9px] font-black tracking-[.14em] text-foreground/45 uppercase">
            Vehicle make
          </legend>
          <button
            className={`min-h-10 cursor-pointer border px-3 text-left text-[10px] font-bold uppercase transition ${vehicleMake === "all" ? "border-brand bg-brand text-black" : "border-foreground/20 hover:border-brand"}`}
            type="button"
            onClick={() => {
              setVehicleMake("all");
              setPage(1);
            }}
          >
            All makes
          </button>
          <div className="flex flex-wrap gap-2">
            {vehicleMakes.map((item) => (
              <button
                className={`min-h-9 cursor-pointer border px-3 text-[9px] font-bold uppercase transition ${vehicleMake === item ? "border-brand bg-brand text-black" : "border-foreground/20 text-foreground/60 hover:border-brand hover:text-brand"}`}
                type="button"
                onClick={() => {
                  setVehicleMake(item);
                  setPage(1);
                }}
                key={item}
              >
                {item} · {vehicleMakeCount(item)}
              </button>
            ))}
          </div>
        </fieldset>
      )}
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
          <header className="flex items-center justify-between gap-5 max-[560px]:flex-col max-[560px]:items-stretch max-[560px]:gap-4">
            <div className="flex items-baseline gap-2">
              <h1
                className={`${buildDisplay} whitespace-nowrap text-[clamp(42px,2vw,72px)] leading-none max-[560px]:text-4xl`}
              >
                In stock
              </h1>
              <span className="text-xl text-foreground/35 max-[560px]:text-base">
                ({filteredProducts.length})
              </span>
            </div>
            <div className="flex items-center gap-2 max-[560px]:w-full">
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
              <Select
                value={sort}
                onValueChange={(value) => {
                  setSort(value as SortOption);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Sort products"
                  className="min-h-11 w-38.5 max-[560px]:w-auto max-[560px]:flex-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: low</SelectItem>
                  <SelectItem value="price-high">Price: high</SelectItem>
                  <SelectItem value="name">Name: A–Z</SelectItem>
                </SelectContent>
              </Select>
              {/*
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
              </label> */}
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
                className={`grid gap-3 max-[680px]:gap-2 ${compact ? "grid-cols-1" : "grid-cols-2"}`}
              >
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    buildDisplay={buildDisplay}
                    isSaved={isSaved}
                    onAdd={addItem}
                    onToggleFavorite={toggleFavorite}
                    compact={compact}
                  />
                ))}
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
