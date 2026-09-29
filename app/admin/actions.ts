"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { centsFromForm, slugify } from "@/lib/admin/format";
import { uploadCommerceImage } from "@/lib/admin/storage";

const orderStatuses = ["pending", "payment_pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  return text(formData, key) || null;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function destination(path: string, type: "saved" | "error", message: string) {
  return `${path}?${type}=${encodeURIComponent(message)}`;
}

async function saveProductRecord(formData: FormData, productId?: string) {
  const { admin } = await requireAdmin();
  const nameEn = text(formData, "name_en");
  const nameEs = text(formData, "name_es") || nameEn;
  const sku = text(formData, "sku").toUpperCase();
  const slug = slugify(text(formData, "slug") || nameEn);

  if (!nameEn || !sku || !slug) throw new Error("Name, SKU and slug are required.");

  const compareAt = optionalText(formData, "compare_at_price");
  const inventory = Number(formData.get("inventory_quantity") ?? 0);
  if (!Number.isInteger(inventory) || inventory < 0) throw new Error("Inventory must be a positive whole number.");

  const payload = {
    slug,
    sku,
    name_en: nameEn,
    name_es: nameEs,
    description_en: optionalText(formData, "description_en"),
    description_es: optionalText(formData, "description_es"),
    short_description_en: optionalText(formData, "short_description_en"),
    short_description_es: optionalText(formData, "short_description_es"),
    price_cents: centsFromForm(formData.get("price")),
    compare_at_price_cents: compareAt ? centsFromForm(compareAt) : null,
    currency: text(formData, "currency") || "USD",
    inventory_quantity: inventory,
    track_inventory: checked(formData, "track_inventory"),
    status: text(formData, "status") || "draft",
    is_featured: checked(formData, "is_featured"),
    metadata: {
      compatibility: optionalText(formData, "compatibility"),
      object_position: optionalText(formData, "object_position") || "center",
    },
  };

  let id = productId;
  if (id) {
    const { error } = await admin.from("products").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await admin.from("products").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    id = data.id;
  }
  if (!id) throw new Error("The product could not be identified after saving.");
  const savedProductId = id;

  const primaryFile = formData.get("primary_image");
  if (primaryFile instanceof File && primaryFile.size) {
    const imageUrl = await uploadCommerceImage(admin, "product-images", savedProductId, primaryFile);
    if (imageUrl) {
      const { error } = await admin.from("products").update({ primary_image_url: imageUrl }).eq("id", savedProductId);
      if (error) throw new Error(error.message);
      await admin.from("product_images").update({ is_primary: false }).eq("product_id", savedProductId);
      const { error: imageError } = await admin.from("product_images").insert({
        product_id: savedProductId,
        image_url: imageUrl,
        alt_en: nameEn,
        alt_es: nameEs,
        sort_order: 0,
        is_primary: true,
      });
      if (imageError) throw new Error(imageError.message);
    }
  }

  const galleryFiles = formData.getAll("gallery_images").filter((file): file is File => file instanceof File && file.size > 0);
  if (galleryFiles.length) {
    const { count } = await admin.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", savedProductId);
    const rows = [];
    for (const [index, file] of galleryFiles.entries()) {
      const imageUrl = await uploadCommerceImage(admin, "product-images", savedProductId, file);
      if (imageUrl) rows.push({ product_id: savedProductId, image_url: imageUrl, alt_en: nameEn, alt_es: nameEs, sort_order: (count ?? 0) + index + 1, is_primary: false });
    }
    if (rows.length) {
      const { error } = await admin.from("product_images").insert(rows);
      if (error) throw new Error(error.message);
    }
  }

  const categoryIds = formData.getAll("category_ids").map(String).filter(Boolean);
  const { error: unlinkError } = await admin.from("product_categories").delete().eq("product_id", savedProductId);
  if (unlinkError) throw new Error(unlinkError.message);
  if (categoryIds.length) {
    const { error } = await admin.from("product_categories").insert(categoryIds.map((categoryId) => ({ product_id: savedProductId, category_id: categoryId })));
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
  return savedProductId;
}

export async function createProduct(formData: FormData) {
  let id: string;
  try {
    id = await saveProductRecord(formData);
  } catch (error) {
    redirect(destination("/admin/products/new", "error", error instanceof Error ? error.message : "Could not create product"));
  }
  redirect(destination(`/admin/products/${id}`, "saved", "Product created"));
}

export async function updateProduct(formData: FormData) {
  const id = text(formData, "id");
  try {
    await saveProductRecord(formData, id);
  } catch (error) {
    redirect(destination(`/admin/products/${id}`, "error", error instanceof Error ? error.message : "Could not update product"));
  }
  redirect(destination(`/admin/products/${id}`, "saved", "Product updated"));
}

export async function archiveProduct(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = text(formData, "id");
  const { error } = await admin.from("products").update({ status: "archived" }).eq("id", id);
  if (error) redirect(destination("/admin/products", "error", error.message));
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect(destination("/admin/products", "saved", "Product archived"));
}

export async function removeProductImage(formData: FormData) {
  const { admin } = await requireAdmin();
  const imageId = text(formData, "image_id");
  const productId = text(formData, "product_id");
  const { error } = await admin.from("product_images").delete().eq("id", imageId).eq("product_id", productId);
  if (error) redirect(destination(`/admin/products/${productId}`, "error", error.message));
  revalidatePath(`/admin/products/${productId}`);
  redirect(destination(`/admin/products/${productId}`, "saved", "Image removed"));
}

export async function createCategory(formData: FormData) {
  const { admin } = await requireAdmin();
  const nameEn = text(formData, "name_en");
  const payload = {
    name_en: nameEn,
    name_es: text(formData, "name_es") || nameEn,
    slug: slugify(text(formData, "slug") || nameEn),
    description_en: optionalText(formData, "description_en"),
    description_es: optionalText(formData, "description_es"),
    is_active: true,
  };
  const { error } = await admin.from("categories").insert(payload);
  if (error) redirect(destination("/admin/categories", "error", error.message));
  revalidatePath("/admin/categories");
  redirect(destination("/admin/categories", "saved", "Category created"));
}

export async function updateCategory(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = text(formData, "id");
  const nameEn = text(formData, "name_en");
  if (!id || !nameEn) redirect(destination("/admin/categories", "error", "The category name is required"));
  const { error } = await admin.from("categories").update({
    name_en: nameEn,
    name_es: text(formData, "name_es") || nameEn,
    slug: slugify(text(formData, "slug") || nameEn),
    description_en: optionalText(formData, "description_en"),
    description_es: optionalText(formData, "description_es"),
  }).eq("id", id);
  if (error) redirect(destination("/admin/categories", "error", error.message));
  revalidatePath("/");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products", "layout");
  redirect(destination("/admin/categories", "saved", "Category updated"));
}

export async function deleteCategory(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = text(formData, "id");
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) redirect(destination("/admin/categories", "error", error.message));
  revalidatePath("/");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products", "layout");
  redirect(destination("/admin/categories", "saved", "Category deleted"));
}

export async function toggleCategory(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = text(formData, "id");
  const isActive = text(formData, "is_active") === "true";
  const { error } = await admin.from("categories").update({ is_active: !isActive }).eq("id", id);
  if (error) redirect(destination("/admin/categories", "error", error.message));
  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect(destination("/admin/categories", "saved", isActive ? "Category hidden" : "Category activated"));
}

export async function updateOrderStatus(formData: FormData) {
  const { admin, userId } = await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status");
  const note = optionalText(formData, "note");
  if (!orderStatuses.includes(status)) redirect(destination(`/admin/orders/${id}`, "error", "Invalid order status"));

  const updates: Record<string, unknown> = { status };
  if (status === "paid") updates.payment_status = "paid";
  const { error } = await admin.from("orders").update(updates).eq("id", id);
  if (error) redirect(destination(`/admin/orders/${id}`, "error", error.message));
  const { error: historyError } = await admin.from("order_status_history").insert({ order_id: id, status, note, created_by: userId });
  if (historyError) redirect(destination(`/admin/orders/${id}`, "error", historyError.message));

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/account/orders/${id}`);
  redirect(destination(`/admin/orders/${id}`, "saved", "Order status updated"));
}

async function saveBuildRecord(formData: FormData, buildId?: string) {
  const { admin } = await requireAdmin();
  const brand = text(formData, "vehicle_brand");
  const modificationEn = text(formData, "modification_en");
  const slug = slugify(text(formData, "slug") || `${brand}-${modificationEn}`);
  if (!brand || !modificationEn || !slug) throw new Error("Brand and modification are required.");

  let id = buildId;
  const coverFile = formData.get("cover_image");
  let coverImageUrl = optionalText(formData, "current_cover_image_url");
  if (coverFile instanceof File && coverFile.size) {
    coverImageUrl = await uploadCommerceImage(admin, "build-images", id ?? "new", coverFile);
  }
  if (!coverImageUrl) throw new Error("A cover image is required.");

  const payload = {
    slug,
    vehicle_brand: brand,
    vehicle_model: optionalText(formData, "vehicle_model"),
    modification_en: modificationEn,
    modification_es: text(formData, "modification_es") || modificationEn,
    description_en: optionalText(formData, "description_en"),
    description_es: optionalText(formData, "description_es"),
    cover_image_url: coverImageUrl,
    is_published: checked(formData, "is_published"),
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  };

  if (id) {
    const { error } = await admin.from("builds").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await admin.from("builds").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    id = data.id;
  }
  if (!id) throw new Error("The build could not be identified after saving.");
  const savedBuildId = id;

  const galleryFiles = formData.getAll("gallery_images").filter((file): file is File => file instanceof File && file.size > 0);
  const rows = [];
  for (const [index, file] of galleryFiles.entries()) {
    const imageUrl = await uploadCommerceImage(admin, "build-images", savedBuildId, file);
    if (imageUrl) rows.push({ build_id: savedBuildId, image_url: imageUrl, alt_en: `${brand} ${modificationEn}`, alt_es: `${brand} ${payload.modification_es}`, sort_order: index + 1 });
  }
  if (rows.length) {
    const { error } = await admin.from("build_images").insert(rows);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/builds");
  return savedBuildId;
}

export async function createBuild(formData: FormData) {
  let id: string;
  try {
    id = await saveBuildRecord(formData);
  } catch (error) {
    redirect(destination("/admin/builds/new", "error", error instanceof Error ? error.message : "Could not create build"));
  }
  redirect(destination(`/admin/builds/${id}`, "saved", "Build created"));
}

export async function updateBuild(formData: FormData) {
  const id = text(formData, "id");
  try {
    await saveBuildRecord(formData, id);
  } catch (error) {
    redirect(destination(`/admin/builds/${id}`, "error", error instanceof Error ? error.message : "Could not update build"));
  }
  redirect(destination(`/admin/builds/${id}`, "saved", "Build updated"));
}

export async function removeBuildImage(formData: FormData) {
  const { admin } = await requireAdmin();
  const imageId = text(formData, "image_id");
  const buildId = text(formData, "build_id");
  const { error } = await admin.from("build_images").delete().eq("id", imageId).eq("build_id", buildId);
  if (error) redirect(destination(`/admin/builds/${buildId}`, "error", error.message));
  revalidatePath(`/admin/builds/${buildId}`);
  redirect(destination(`/admin/builds/${buildId}`, "saved", "Image removed"));
}

export async function addHeroSlides(formData: FormData) {
  const { admin } = await requireAdmin();
  const files = formData.getAll("hero_images").filter((file): file is File => file instanceof File && file.size > 0);
  if (!files.length) redirect(destination("/admin/hero", "error", "Select at least one image"));

  const { count, error: countError } = await admin.from("hero_slides").select("id", { count: "exact", head: true });
  if (countError) redirect(destination("/admin/hero", "error", countError.message));
  const remaining = Math.max(0, 10 - (count ?? 0));
  if (!remaining || files.length > remaining) redirect(destination("/admin/hero", "error", `The hero supports up to 10 images. ${remaining} slot${remaining === 1 ? " remains" : "s remain"}.`));

  const altEn = optionalText(formData, "alt_en") || "Basement Performance Products featured build";
  const altEs = optionalText(formData, "alt_es") || altEn;
  const objectPosition = optionalText(formData, "object_position") || "center";
  const rows = [];
  for (const [index, file] of files.entries()) {
    const imageUrl = await uploadCommerceImage(admin, "hero-images", "slides", file);
    if (imageUrl) rows.push({ image_url: imageUrl, alt_en: altEn, alt_es: altEs, object_position: objectPosition, sort_order: (count ?? 0) + index, is_active: true });
  }
  const { error } = await admin.from("hero_slides").insert(rows);
  if (error) redirect(destination("/admin/hero", "error", error.message));
  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect(destination("/admin/hero", "saved", `${rows.length} hero image${rows.length === 1 ? "" : "s"} added`));
}

export async function toggleHeroSlide(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = text(formData, "id");
  const isActive = text(formData, "is_active") === "true";
  const { error } = await admin.from("hero_slides").update({ is_active: !isActive }).eq("id", id);
  if (error) redirect(destination("/admin/hero", "error", error.message));
  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect(destination("/admin/hero", "saved", isActive ? "Hero image hidden" : "Hero image activated"));
}

export async function deleteHeroSlide(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = text(formData, "id");
  const { error } = await admin.from("hero_slides").delete().eq("id", id);
  if (error) redirect(destination("/admin/hero", "error", error.message));
  revalidatePath("/");
  revalidatePath("/admin/hero");
  redirect(destination("/admin/hero", "saved", "Hero image removed"));
}
