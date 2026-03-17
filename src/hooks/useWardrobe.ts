import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { ClothingItem } from "@/types";

export function useWardrobe() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ items: ClothingItem[] }>("/wardrobe")
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading };
}
