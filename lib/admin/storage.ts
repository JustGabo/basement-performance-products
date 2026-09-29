import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

function safeFileName(name: string) {
  const extension = name.includes(".") ? name.split(".").pop()?.toLowerCase() : "jpg";
  return `${crypto.randomUUID()}.${extension?.replace(/[^a-z0-9]/g, "") || "jpg"}`;
}

export async function uploadCommerceImage(
  admin: SupabaseClient,
  bucket: "product-images" | "build-images" | "hero-images",
  folder: string,
  file: File,
) {
  if (!file.size) return null;
  if (!file.type.startsWith("image/")) throw new Error("Only image files are supported.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Images must be smaller than 8 MB.");

  const path = `${folder}/${safeFileName(file.name)}`;
  const { error } = await admin.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  return admin.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
