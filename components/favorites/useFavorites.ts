"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { StoreProduct } from "@/lib/commerce";
import { createClient } from "@/lib/supabase/client";

type Locale = "en" | "es";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const messages = {
  en: { added: "Saved to favorites", removed: "Removed from favorites", signIn: "Sign in to save favorites", action: "View favorites", authAction: "Sign in", error: "Favorites could not be updated" },
  es: { added: "Guardado en favoritos", removed: "Eliminado de favoritos", signIn: "Inicia sesión para guardar favoritos", action: "Ver favoritos", authAction: "Iniciar sesión", error: "No se pudieron actualizar los favoritos" },
};

export function useFavorites(locale: Locale = "en") {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        const { data } = await supabase.from("favorites").select("product_id").eq("user_id", userData.user.id);
        if (active) setSavedIds(new Set((data ?? []).map((favorite) => favorite.product_id)));
      } catch {
        // The storefront can run with fixtures before Supabase is configured.
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const toggleFavorite = async (product: StoreProduct) => {
    const t = messages[locale];
    let supabase;
    try {
      supabase = createClient();
    } catch {
      toast.error(t.error);
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.info(t.signIn, { action: { label: t.authAction, onClick: () => router.push(`/sign-in?next=/products/${product.slug}`) } });
      return;
    }
    if (!uuidPattern.test(product.id)) {
      toast.error(t.error);
      return;
    }

    const wasSaved = savedIds.has(product.id);
    setSavedIds((current) => {
      const next = new Set(current);
      if (wasSaved) next.delete(product.id);
      else next.add(product.id);
      return next;
    });

    const result = wasSaved
      ? await supabase.from("favorites").delete().eq("user_id", userData.user.id).eq("product_id", product.id)
      : await supabase.from("favorites").insert({ user_id: userData.user.id, product_id: product.id });

    if (result.error) {
      setSavedIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.add(product.id);
        else next.delete(product.id);
        return next;
      });
      toast.error(t.error, { description: result.error.message });
      return;
    }

    toast.success(wasSaved ? t.removed : t.added, {
      description: product.name,
      action: { label: t.action, onClick: () => router.push("/account/favorites") },
    });
  };

  return { isSaved: (productId: string) => savedIds.has(productId), toggleFavorite };
}
