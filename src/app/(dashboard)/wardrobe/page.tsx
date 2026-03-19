"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  X,
  Upload,
  Camera,
  Tag,
  Shirt,
  Loader2,
} from "lucide-react";
import type { ClothingCategory } from "@/types";

const API_URL = "http://localhost:5000/api/wardrobe";
const LS_KEY = "tfc-wardrobe";

// ── Types ────────────────────────────────────────────────

interface BackendItem {
  _id: string;
  name: string;
  category: string;
  color: string;
  occasions?: string[];
  imageBase64?: string;
  imageUrl?: string;
  createdAt: string;
}

// ── localStorage helpers ─────────────────────────────────

function lsLoad(): BackendItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as BackendItem[]) : [];
  } catch {
    return [];
  }
}

function lsSave(items: BackendItem[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch { /* quota exceeded — ignore */ }
}

// ── Category tabs ────────────────────────────────────────

const CATEGORIES = [
  { key: "all" as const, label: "All", emoji: "✨" },
  { key: "tops" as const, label: "Tops", emoji: "👕" },
  { key: "bottoms" as const, label: "Bottoms", emoji: "👖" },
  { key: "shoes" as const, label: "Shoes", emoji: "👟" },
  { key: "accessories" as const, label: "Accessories", emoji: "💍" },
  { key: "blazer" as const, label: "Blazer", emoji: "🧥" },
];

type CategoryKey = "all" | ClothingCategory;

const COLOR_PRESETS = [
  "#000000", "#ffffff", "#e94560", "#2d6a4f", "#3b82f6",
  "#f59e0b", "#8b5cf6", "#ec4899", "#6b7280", "#92400e",
];

const CATEGORY_OPTIONS: { value: ClothingCategory; label: string }[] = [
  { value: "tops", label: "Tops" },
  { value: "bottoms", label: "Bottoms" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
  { value: "blazer", label: "Blazer" },
];

const OCCASION_OPTIONS = ["casual", "formal", "party"] as const;

const COLOR_LABELS: Record<string, string> = {
  "#000000": "Black",
  "#ffffff": "White",
  "#e94560": "Red",
  "#2d6a4f": "Green",
  "#3b82f6": "Blue",
  "#f59e0b": "Yellow",
  "#8b5cf6": "Purple",
  "#ec4899": "Pink",
  "#6b7280": "Gray",
  "#92400e": "Brown",
};

const OCCASION_BADGE_STYLES: Record<string, string> = {
  casual: "bg-[#3b82f6]/20 text-[#93c5fd] border border-[#3b82f6]/30",
  formal: "bg-[#8b5cf6]/20 text-[#c4b5fd] border border-[#8b5cf6]/30",
  party: "bg-[#e94560]/20 text-[#f9a8d4] border border-[#e94560]/30",
};

function buildItemName(colorHex: string, category: ClothingCategory) {
  const colorName = COLOR_LABELS[colorHex.toLowerCase()] ?? "Custom";
  const categoryLabel = CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label ?? "Item";
  return `${colorName} ${categoryLabel}`;
}

// ── Color swatch ─────────────────────────────────────────

function ColorSwatch({ hex, size = 14 }: { hex: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full border border-[#233554]"
      style={{ width: size, height: size, backgroundColor: hex }}
    />
  );
}

// ── Add Item Modal ───────────────────────────────────────

type UploadStep = "choose" | "tag";

function AddItemModal({
  onClose,
  onItemAdded,
}: {
  onClose: () => void;
  onItemAdded: (item: BackendItem) => void;
}) {
  const [step, setStep] = useState<UploadStep>("choose");
  const [imageData, setImageData] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  // Tag form state
  const [category, setCategory] = useState<ClothingCategory>("tops");
  const [occasions, setOccasions] = useState<string[]>(["casual"]);
  const [color, setColor] = useState("#000000");

  // ── Auto-detect category from image ──
  const detectCategory = useCallback(async (base64: string) => {
    setDetecting(true);
    try {
      const res = await fetch(`${API_URL}/detect-category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      if (!res.ok) throw new Error("detect failed");
      const data = await res.json();
      // Map AI category to our ClothingCategory
      const catMap: Record<string, ClothingCategory> = {
        top: "tops", tops: "tops",
        bottom: "bottoms", bottoms: "bottoms",
        shoes: "shoes", shoe: "shoes", footwear: "shoes",
        accessory: "accessories", accessories: "accessories",
        traditional: "dresses", dress: "dresses", dresses: "dresses",
        outerwear: "blazer", jacket: "blazer", blazer: "blazer",
        formal: "formal", activewear: "activewear",
      };
      const detected = (data.category || "").toLowerCase();
      const mapped = catMap[detected] || "tops";
      setCategory(mapped);
      if (data.color) setColor(data.color);
    } catch {
      // Detection failed — user selects manually
    } finally {
      setDetecting(false);
    }
  }, []);

  // ── Dropzone ──
  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImageData(base64);
      setStep("tag");
      setShowWebcam(false);
      detectCategory(base64);
    };
    reader.readAsDataURL(file);
  }, [detectCategory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // ── Webcam capture ──
  const capturePhoto = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      setImageData(screenshot);
      setStep("tag");
      setShowWebcam(false);
      detectCategory(screenshot);
    }
  }, [detectCategory]);

  // ── Save item to backend, fallback to local ──
  const handleSave = async () => {
    if (!imageData || occasions.length === 0 || saving) return;
    const generatedName = buildItemName(color, category);
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generatedName,
          category,
          occasions,
          color,
          imageBase64: imageData,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      onItemAdded(data.item);
    } catch {
      // Backend down — save locally
      const localItem: BackendItem = {
        _id: `local-${Date.now()}`,
        name: generatedName,
        category,
        occasions,
        color,
        imageBase64: imageData,
        createdAt: new Date().toISOString(),
      };
      onItemAdded(localItem);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-[#16213e] rounded-2xl overflow-hidden border border-[#233554] shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#233554]">
          <h2 className="text-lg font-bold text-white">
            {step === "choose" ? "Add Clothing" : "Tag Your Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8899aa] hover:text-white hover:bg-[#233554] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === "choose" && !showWebcam && (
            <div className="space-y-4">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-[#e94560] bg-[#e94560]/10"
                    : "border-[#233554] hover:border-[#e94560]/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-[#8899aa] mx-auto mb-3" />
                <p className="text-white text-sm font-medium">
                  {isDragActive ? "Drop it here!" : "Drag & drop a photo"}
                </p>
                <p className="text-[#8899aa] text-xs mt-1">or click to browse</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#233554]" />
                <span className="text-[#8899aa] text-xs">OR</span>
                <div className="flex-1 h-px bg-[#233554]" />
              </div>

              {/* Webcam button */}
              <button
                onClick={() => setShowWebcam(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#233554] text-white text-sm font-medium hover:bg-[#2a3f5f] transition-colors"
              >
                <Camera className="w-4 h-4" />
                Take a Photo
              </button>
            </div>
          )}

          {/* Webcam view */}
          {step === "choose" && showWebcam && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-black">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWebcam(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#233554] text-white text-sm font-medium hover:bg-[#2a3f5f] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-medium hover:bg-[#d13a52] transition-colors"
                >
                  Capture
                </button>
              </div>
            </div>
          )}

          {/* Tagging form */}
          {step === "tag" && imageData && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#1a1a2e]">
                <Image
                  src={imageData}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Detection status */}
              {detecting && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#e94560]/10 border border-[#e94560]/20">
                  <Loader2 className="w-4 h-4 text-[#e94560] animate-spin" />
                  <span className="text-[#e94560] text-sm">🤖 AI detecting clothing type...</span>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm text-[#8899aa] mb-1.5">Category</label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {CATEGORY_OPTIONS.map((opt) => {
                    const selected = category === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setCategory(opt.value)}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                          selected
                            ? "bg-[#e94560] border-[#e94560] text-white"
                            : "bg-[#1a1a2e] border-[#16213e] text-[#8899aa] hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Occasion */}
              <div>
                <label className="block text-sm text-[#8899aa] mb-1.5">Occasion</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {OCCASION_OPTIONS.map((opt) => {
                    const selected = occasions.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          setOccasions((prev) => {
                            if (prev.includes(opt)) {
                              return prev.length === 1 ? prev : prev.filter((item) => item !== opt);
                            }
                            return [...prev, opt];
                          });
                        }}
                        className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-colors ${
                          selected
                            ? "bg-[#e94560] border-[#e94560] text-white"
                            : "bg-[#1a1a2e] border-[#16213e] text-[#8899aa] hover:text-white"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm text-[#8899aa] mb-1.5">Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === c ? "border-[#e94560] scale-110" : "border-[#233554]"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-7 h-7 rounded-full border-2 border-[#233554] cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setStep("choose");
                    setImageData(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#233554] text-white text-sm font-medium hover:bg-[#2a3f5f] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={occasions.length === 0 || saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-medium hover:bg-[#d13a52] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {saving ? "Saving…" : "Add Item"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────

export default function WardrobePage() {
  const [items, setItems] = useState<BackendItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch items from backend on mount, fallback to localStorage
  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        const fetched = data.items || [];
        setItems(fetched);
        lsSave(fetched);
      } catch {
        setItems(lsLoad());
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  // ── Filtered items ──
  const filtered = useMemo(() => {
    let result = items;
    if (activeCategory !== "all") {
      result = result.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, activeCategory, search]);

  const handleItemAdded = useCallback((item: BackendItem) => {
    setItems((prev) => {
      const next = [item, ...prev];
      lsSave(next);
      return next;
    });
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    // Optimistic delete — update UI immediately
    setItems((prev) => {
      const next = prev.filter((i) => i._id !== id);
      lsSave(next);
      return next;
    });
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    } catch {
      // Backend down — local delete already applied
    }
  }, []);

  const getImageSrc = (item: BackendItem) => {
    if (item.imageBase64) return item.imageBase64;
    if (item.imageUrl) return item.imageUrl;
    return "";
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-[#1a1a2e]/80 backdrop-blur-md border-b border-[#233554]">
        <div className="max-w-5xl mx-auto px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">My Wardrobe</h1>
              <p className="text-[#8899aa] text-sm mt-0.5">
                {items.length} piece{items.length !== 1 && "s"}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-medium hover:bg-[#d13a52] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Clothes
            </button>
          </div>

          {/* ── Search ── */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899aa]" />
            <input
              type="text"
              placeholder="Search your wardrobe…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#16213e] text-white text-sm placeholder:text-[#8899aa]/60 border border-[#233554] focus:border-[#e94560]/50 focus:outline-none transition-colors"
            />
          </div>

          {/* ── Category Tabs ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    active
                      ? "bg-[#e94560] text-white shadow-sm"
                      : "bg-[#16213e] text-[#8899aa] hover:bg-[#233554]"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Grid ── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#e94560] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {items.length === 0 ? (
              <>
                <Shirt className="w-16 h-16 text-[#233554] mb-4" />
                <p className="text-white font-semibold text-lg">Your wardrobe is empty</p>
                <p className="text-[#8899aa] text-sm mt-2 max-w-xs">
                  Add your first item by uploading a photo or taking one with your camera!
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-medium hover:bg-[#d13a52] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Item
                </button>
              </>
            ) : (
              <>
                <Tag className="w-12 h-12 text-[#233554] mb-3" />
                <p className="text-white font-medium">No items found</p>
                <p className="text-[#8899aa] text-sm mt-1">Try a different search term</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item, idx) => (
              <motion.div
                key={item._id}
                className="bg-[#16213e] rounded-2xl overflow-hidden border border-[#233554] shadow-sm hover:shadow-lg hover:border-[#e94560]/30 transition-all group relative"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(item._id)}
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Image */}
                <div className="relative aspect-square bg-[#1a1a2e]">
                  {getImageSrc(item) ? (
                    <Image
                      src={getImageSrc(item)}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shirt className="w-10 h-10 text-[#233554]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-1.5">
                  <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <ColorSwatch hex={item.color} />
                    <p className="text-[#8899aa] text-xs capitalize">{item.category}</p>
                  </div>
                  {!!item.occasions?.length && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.occasions.map((occasion) => {
                        const normalized = occasion.toLowerCase();
                        const style = OCCASION_BADGE_STYLES[normalized];
                        if (!style) return null;
                        return (
                          <span
                            key={`${item._id}-${normalized}`}
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${style}`}
                          >
                            {normalized}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ── Add Item Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <AddItemModal
            onClose={() => setShowAddModal(false)}
            onItemAdded={handleItemAdded}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
