import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { archiveProduct, createProduct, removeProductImage, updateProduct } from "@/app/admin/actions";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { ImageUploadPreview } from "@/components/admin/ImageUploadPreview";
import { RoundCheckbox } from "@/components/admin/RoundCheckbox";
import { DirtySubmitButton } from "@/components/admin/DirtySubmitButton";

type Category = { id: string; name_en: string };
type ProductImage = { id: string; image_url: string; alt_en: string | null; is_primary: boolean };
export type EditableProduct = {
  id: string;
  slug: string;
  sku: string;
  name_en: string;
  name_es: string;
  description_en: string | null;
  description_es: string | null;
  short_description_en: string | null;
  short_description_es: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
  inventory_quantity: number;
  track_inventory: boolean;
  status: string;
  is_featured: boolean;
  primary_image_url: string | null;
  metadata: Record<string, unknown> | null;
  product_images: ProductImage[];
  product_categories: Array<{ category_id: string }>;
};

const input = "min-h-12 w-full border border-foreground/18 bg-ink px-4 text-sm outline-none transition placeholder:text-foreground/25 focus:border-brand";
const label = "flex flex-col gap-2 text-[9px] font-black tracking-[.08em] text-foreground/65 uppercase";

export function ProductForm({ product, categories }: { product?: EditableProduct; categories: Category[] }) {
  const action = product ? updateProduct : createProduct;
  const selectedCategories = new Set(product?.product_categories.map((category) => category.category_id) ?? []);
  const compatibility = typeof product?.metadata?.compatibility === "string" ? product.metadata.compatibility : "";
  const objectPosition = typeof product?.metadata?.object_position === "string" ? product.metadata.object_position : "center";

  return <div className="flex flex-col gap-5">
    <form action={action} className="flex flex-col gap-6">
      {product && <input name="id" type="hidden" value={product.id} />}
      <section className="grid grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)] items-start gap-5 max-xl:grid-cols-1">
        <div className="flex flex-col gap-6 border border-foreground/12 bg-panel p-6 max-[600px]:p-4">
          <div className="flex flex-col gap-1"><h2 className="font-display text-2xl font-bold uppercase">Product information</h2><p className="text-xs text-foreground/45">Names and descriptions shown across both storefront languages.</p></div>
          <div className="grid grid-cols-2 gap-4 max-[650px]:grid-cols-1"><label className={label}>English name<input className={input} defaultValue={product?.name_en} name="name_en" required /></label><label className={label}>Spanish name<input className={input} defaultValue={product?.name_es} name="name_es" /></label></div>
          <div className="grid grid-cols-2 gap-4 max-[650px]:grid-cols-1"><label className={label}>SKU · internal product code<input className={input} defaultValue={product?.sku} name="sku" placeholder="BPP-BMW-G80-FL-001" required /><span className="text-[9px] leading-4 font-normal tracking-normal text-foreground/40 normal-case">A unique code used to identify this product in inventory and orders.</span></label><label className={label}>URL slug<input className={input} defaultValue={product?.slug} name="slug" placeholder="Generated from the English name" /><span className="text-[9px] leading-4 font-normal tracking-normal text-foreground/40 normal-case">The readable URL generated from the product name if left empty.</span></label></div>
          <div className="grid grid-cols-2 gap-4 max-[650px]:grid-cols-1"><label className={label}>Short description · EN<input className={input} defaultValue={product?.short_description_en ?? ""} name="short_description_en" /></label><label className={label}>Short description · ES<input className={input} defaultValue={product?.short_description_es ?? ""} name="short_description_es" /></label></div>
          <div className="grid grid-cols-2 gap-4 max-[650px]:grid-cols-1"><label className={label}>Description · EN<textarea className={`${input} min-h-36 py-3`} defaultValue={product?.description_en ?? ""} name="description_en" /></label><label className={label}>Description · ES<textarea className={`${input} min-h-36 py-3`} defaultValue={product?.description_es ?? ""} name="description_es" /></label></div>
          <label className={label}>Compatibility<input className={input} defaultValue={compatibility} name="compatibility" placeholder="BMW G80 2021–2026" /></label>
        </div>

        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-5 border border-foreground/12 bg-panel p-6 max-[600px]:p-4"><h2 className="font-display text-2xl font-bold uppercase">Commerce</h2><div className="grid grid-cols-2 gap-4"><label className={label}>Price · USD<input className={input} defaultValue={product ? product.price_cents / 100 : ""} min="0" name="price" required step="0.01" type="number" /></label><label className={label}>Compare at<input className={input} defaultValue={product?.compare_at_price_cents ? product.compare_at_price_cents / 100 : ""} min="0" name="compare_at_price" step="0.01" type="number" /></label></div><input name="currency" type="hidden" value="USD" /><label className={label}>Inventory<input className={input} defaultValue={product?.inventory_quantity ?? 0} min="0" name="inventory_quantity" required step="1" type="number" /></label><label className={label}>Status<select className={input} defaultValue={product?.status ?? "draft"} name="status"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label><div className="flex flex-col gap-3"><RoundCheckbox defaultChecked={product?.track_inventory ?? true} label="Track inventory" name="track_inventory" /><RoundCheckbox defaultChecked={product?.is_featured ?? false} label="Featured product" name="is_featured" /></div></section>
          <section className="flex flex-col gap-4 border border-foreground/12 bg-panel p-6 max-[600px]:p-4"><h2 className="font-display text-2xl font-bold uppercase">Categories</h2>{categories.length ? <div className="grid grid-cols-2 gap-3">{categories.map((category) => <RoundCheckbox defaultChecked={selectedCategories.has(category.id)} label={category.name_en} name="category_ids" value={category.id} key={category.id} />)}</div> : <p className="text-xs text-foreground/45">Create a category first or save without one.</p>}</section>
        </div>
      </section>

      <section className="flex flex-col gap-5 border border-foreground/12 bg-panel p-6 max-[600px]:p-4"><div className="flex items-center gap-3"><ImagePlus className="text-brand" size={20} /><div className="flex flex-col gap-1"><h2 className="font-display text-2xl font-bold uppercase">Product media</h2><p className="text-xs text-foreground/45">Preview files locally, remove unwanted selections, then upload everything when the product is saved.</p></div></div><div className="grid grid-cols-2 items-start gap-6 max-[800px]:grid-cols-1"><ImageUploadPreview label={product ? "Replace primary image" : "Primary image"} name="primary_image" /><ImageUploadPreview label="New gallery images" multiple name="gallery_images" /></div><label className={`${label} max-w-sm`}>Crop focus<select className={input} defaultValue={objectPosition} name="object_position">{!["center", "center top", "center bottom", "left center", "right center"].includes(objectPosition) && <option value={objectPosition}>Current custom position</option>}<option value="center">Center</option><option value="center top">Top</option><option value="center bottom">Bottom</option><option value="left center">Left</option><option value="right center">Right</option></select><span className="text-[9px] leading-4 font-normal tracking-normal text-foreground/40 normal-case">Choose which area should remain visible when the storefront crops the image to fit a card.</span></label></section>

      <div className="flex flex-wrap items-center justify-between gap-4"><DirtySubmitButton editing={Boolean(product)} label={product ? "Save product" : "Create product"} />{product && <span className="text-[10px] text-foreground/35">Save is enabled when a field or image changes.</span>}</div>
    </form>

    {product?.product_images?.length ? <section className="flex flex-col gap-4 border border-foreground/12 bg-panel p-6 max-[600px]:p-4"><h2 className="font-display text-2xl font-bold uppercase max-[600px]:text-[28px]">Current gallery</h2><div className="grid grid-cols-5 gap-3 max-xl:grid-cols-4 max-[800px]:grid-cols-2 max-[380px]:grid-cols-1">{product.product_images.map((image) => <article className="relative flex min-w-0 flex-col overflow-hidden border border-foreground/12 bg-ink" key={image.id}><div className="relative aspect-[4/3]"><Image className="object-cover" src={image.image_url} alt={image.alt_en ?? product.name_en} fill sizes="(max-width: 380px) 100vw, (max-width: 800px) 50vw, 180px" /><div className="absolute top-2 right-2"><ConfirmAction action={removeProductImage} fields={{ image_id: image.id, product_id: product.id }} title="Remove image?" description={`This image will be removed from ${product.name_en}'s gallery. This action cannot be undone.`} confirmLabel="Remove image" trigger={<button className="grid size-10 cursor-pointer place-items-center border border-red-700/60 bg-black/85 text-red-400 shadow-lg backdrop-blur transition hover:bg-red-950" type="button" aria-label="Remove image"><Trash2 size={17} /></button>} /></div></div><div className="flex min-h-10 items-center px-3"><span className="text-[9px] font-black tracking-[.08em] text-foreground/55 uppercase">{image.is_primary ? "Primary" : "Gallery"}</span></div></article>)}</div></section> : null}

    {product && <div className="flex items-center justify-between gap-5 border border-red-500/20 bg-red-500/5 p-5 max-[650px]:items-start max-[650px]:flex-col"><div className="flex flex-col gap-1"><strong className="text-xs text-red-400">Archive this product</strong><span className="text-[10px] text-foreground/45">It will disappear from the storefront but remain available in historical orders.</span></div><ConfirmAction action={archiveProduct} fields={{ id: product.id }} title="Archive product?" description={`${product.name_en} will disappear from the storefront. Historical order data will remain intact.`} confirmLabel="Archive product" trigger={<button className="flex min-h-11 cursor-pointer items-center gap-2 border border-red-500/35 px-5 text-[9px] font-black text-red-400 uppercase" type="button"><Trash2 size={15} />Archive</button>} /></div>}
  </div>;
}
