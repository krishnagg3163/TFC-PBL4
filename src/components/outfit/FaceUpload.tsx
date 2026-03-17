"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  X,
  RefreshCw,
  ChevronRight,
  Shirt,
  Footprints,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { OutfitSuggestion } from "@/types";

const WARDROBE_API = "http://localhost:5000/api/wardrobe";

type Mode = "idle" | "webcam" | "preview";

interface OutfitDetailModalProps {
  suggestion: OutfitSuggestion;
  onClose: () => void;
}

function OutfitDetailModal({ suggestion, onClose }: OutfitDetailModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md bg-card rounded-2xl border border-border overflow-hidden shadow-2xl"
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-dark/60 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-5 pt-5 pb-3">
          <h3 className="font-display font-bold text-lg text-foreground">{suggestion.name}</h3>
          <p className="text-muted text-sm">{suggestion.occasion}</p>
        </div>

        <div className="px-5 pb-5 space-y-3">
          {suggestion.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-dark/40 rounded-xl p-3 border border-border">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium truncate">{item.name}</p>
                <p className="text-muted text-xs capitalize">{item.category} · {item.color}</p>
                {item.brand && <p className="text-muted text-xs">{item.brand}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-5 flex gap-2 text-xs text-muted">
          <span className="bg-dark/50 border border-border rounded-full px-3 py-1 capitalize">{suggestion.season}</span>
          <span className="bg-dark/50 border border-border rounded-full px-3 py-1">{suggestion.generatedBy === "ai" ? "AI Generated" : suggestion.generatedBy}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-52 bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-48 bg-border/30" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-border/40 rounded w-3/4" />
        <div className="h-3 bg-border/30 rounded w-1/2" />
        <div className="flex gap-1 pt-1">
          <div className="h-5 w-12 bg-border/30 rounded-full" />
          <div className="h-5 w-12 bg-border/30 rounded-full" />
          <div className="h-5 w-12 bg-border/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}

const categoryIcon: Record<string, typeof Shirt> = {
  tops: Shirt,
  bottoms: Shirt,
  shoes: Footprints,
};

export function FaceUpload() {
  const [mode, setMode] = useState<Mode>("idle");
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitSuggestion | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<string[]>([]);

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch wardrobe items from backend on mount
  useEffect(() => {
    async function loadWardrobe() {
      try {
        const res = await fetch(WARDROBE_API);
        if (!res.ok) return;
        const data = await res.json();
        const names = (data.items || []).map((i: { name: string }) => i.name);
        setWardrobeItems(names);
      } catch {
        // ignore — wardrobe items are optional context
      }
    }
    loadWardrobe();
  }, []);

  // ── Fetch suggestions from backend ──────────────────────
  const fetchSuggestions = useCallback(async (imageSrc: string) => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const data = await apiFetch<{ outfits: OutfitSuggestion[] }>("/outfit/generate", {
        method: "POST",
        body: JSON.stringify({ image: imageSrc, wardrobeItems }),
      });
      setSuggestions(data.outfits ?? []);
    } catch {
      setError("Failed to generate outfit suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [wardrobeItems]);

  // ── Photo handlers ──────────────────────────────────────
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPhotoSrc(result);
        setMode("preview");
        fetchSuggestions(result);
      };
      reader.readAsDataURL(file);
    },
    [fetchSuggestions],
  );

  const captureWebcam = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      setPhotoSrc(screenshot);
      setMode("preview");
      fetchSuggestions(screenshot);
    }
  }, [fetchSuggestions]);

  const reset = useCallback(() => {
    setPhotoSrc(null);
    setSuggestions([]);
    setError(null);
    setMode("idle");
  }, []);

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* ─── Upload / Webcam Area ─── */}
      <AnimatePresence mode="wait">
        {mode === "idle" && (
          <motion.div
            key="idle"
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-xl text-foreground">
                Upload Your Photo
              </h2>
            </div>
            <p className="text-muted text-sm text-center max-w-xs">
              Upload a selfie or take a photo and we&apos;ll suggest outfits that suit you.
            </p>

            <div className="flex gap-3 mt-2">
              {/* File upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Webcam */}
              <button
                onClick={() => setMode("webcam")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-card-hover transition-colors"
              >
                <Camera className="w-4 h-4" />
                Take Selfie
              </button>
            </div>
          </motion.div>
        )}

        {mode === "webcam" && (
          <motion.div
            key="webcam"
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="relative w-72 h-72 rounded-2xl overflow-hidden border-2 border-border shadow-lg">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user", width: 480, height: 480 }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={captureWebcam}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
              >
                <Camera className="w-4 h-4" />
                Capture
              </button>
              <button
                onClick={() => setMode("idle")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-muted hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {mode === "preview" && photoSrc && (
          <motion.div
            key="preview"
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {/* Photo preview */}
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/20">
              <Image
                src={photoSrc}
                alt="Your uploaded photo"
                fill
                className="object-cover"
                sizes="160px"
                unoptimized
              />
            </div>

            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change photo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Error ─── */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-center text-sm text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ─── Loading Skeletons ─── */}
      {loading && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-spin" />
            Generating outfit suggestions…
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Suggestions Grid ─── */}
      {!loading && suggestions.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-display font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Outfit Suggestions
            <span className="text-muted text-sm font-normal ml-auto flex items-center gap-1">
              Scroll <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </h3>

          <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory">
            {suggestions.map((s, idx) => (
              <motion.button
                key={s.id}
                onClick={() => setSelectedOutfit(s)}
                className="flex-shrink-0 w-52 bg-card rounded-2xl border border-border overflow-hidden text-left hover:border-primary/50 transition-colors group snap-start"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -4 }}
              >
                {/* Image stack preview */}
                <div className="relative h-48 bg-dark/40">
                  {s.items[0]?.imageUrl ? (
                    <Image
                      src={s.items[0].imageUrl}
                      alt={s.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="208px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shirt className="w-10 h-10 text-muted" />
                    </div>
                  )}

                  {/* Item count badge */}
                  <span className="absolute top-2 right-2 bg-dark/70 backdrop-blur text-xs text-foreground px-2 py-0.5 rounded-full border border-border">
                    {s.items.length} items
                  </span>
                </div>

                {/* Info */}
                <div className="p-3 space-y-1.5">
                  <p className="text-foreground text-sm font-semibold truncate">{s.name}</p>
                  <p className="text-muted text-xs truncate">{s.occasion}</p>

                  {/* Category pills */}
                  <div className="flex gap-1 flex-wrap">
                    {s.items.map((item) => {
                      const Icon = categoryIcon[item.category] ?? Shirt;
                      return (
                        <span
                          key={item.id}
                          className="flex items-center gap-0.5 text-[10px] text-muted bg-dark/50 border border-border rounded-full px-2 py-0.5"
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {item.category}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Detail Modal ─── */}
      <AnimatePresence>
        {selectedOutfit && (
          <OutfitDetailModal
            suggestion={selectedOutfit}
            onClose={() => setSelectedOutfit(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
