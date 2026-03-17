"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  Sparkles,
  ArrowRight,
  Zap,
  Shirt,
  Footprints,
  Watch,
  Gem,
  Loader2,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// ── Types ────────────────────────────────────────────────

interface GlowUpTip {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: string;
}

interface GlowUpResponse {
  overallScore: number;
  glowedUpScore: number;
  summary: string;
  tips: GlowUpTip[];
}

// ── Helpers ──────────────────────────────────────────────

const impactColor: Record<string, string> = {
  high: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-muted/15 text-muted border-muted/30",
};

const categoryIcon: Record<string, typeof Shirt> = {
  fit: Shirt,
  shoes: Footprints,
  accessories: Watch,
  outerwear: Gem,
};

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const pct = (score / 10) * 100;
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#233554" strokeWidth="5" />
          <motion.circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground">
          {score}
        </span>
      </div>
      <span className="text-xs text-muted font-medium">{label}</span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────

export default function GlowUpPage() {
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [result, setResult] = useState<GlowUpResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [appliedTips, setAppliedTips] = useState<Set<string>>(new Set());

  const fileRef = useRef<HTMLInputElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // ── Upload handler ──
  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoSrc(reader.result as string);
      setResult(null);
      setAppliedTips(new Set());
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  // ── Analyze ──
  const analyze = useCallback(async () => {
    if (!photoSrc) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<GlowUpResponse>("/outfit/glowup", {
        method: "POST",
        body: JSON.stringify({ image: photoSrc }),
      });
      setResult(data);
    } catch {
      setError("Analysis failed — please try again.");
    } finally {
      setLoading(false);
    }
  }, [photoSrc]);

  // ── Slider drag ──
  const handleSliderMove = useCallback(
    (clientX: number) => {
      if (!sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPos((x / rect.width) * 100);
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handleSliderMove(e.clientX);
    },
    [handleSliderMove],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.buttons === 0) return;
      handleSliderMove(e.clientX);
    },
    [handleSliderMove],
  );

  // ── Reset ──
  const reset = useCallback(() => {
    setPhotoSrc(null);
    setResult(null);
    setError(null);
    setAppliedTips(new Set());
    setSliderPos(50);
  }, []);

  const toggleTip = useCallback((tipId: string) => {
    setAppliedTips((prev) => {
      const next = new Set(prev);
      if (next.has(tipId)) next.delete(tipId);
      else next.add(tipId);
      return next;
    });
  }, []);

  // ── Render ──
  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              Outfit <span className="text-primary">Glow-Up</span>
            </h1>
          </div>
          {photoSrc && (
            <button
              onClick={reset}
              className="text-muted text-sm flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Start over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* ── Upload State ── */}
        <AnimatePresence mode="wait">
          {!photoSrc && (
            <motion.div
              key="upload"
              className="flex flex-col items-center gap-5 py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  Upload your outfit
                </h2>
                <p className="text-muted text-sm mt-1 max-w-sm">
                  Take a full-body photo and our AI stylist will suggest specific
                  improvements to level up your look.
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-card-hover transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Photo uploaded, pre-analysis ── */}
        {photoSrc && !result && !loading && (
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative w-64 h-80 rounded-2xl overflow-hidden border border-border shadow-lg">
              <Image
                src={photoSrc}
                alt="Your outfit"
                fill
                className="object-cover"
                sizes="256px"
                unoptimized
              />
            </div>
            <button
              onClick={analyze}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-5 h-5" />
              Analyze &amp; Glow Up
            </button>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <motion.div
            className="flex flex-col items-center gap-4 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted text-sm">Our AI stylist is analyzing your outfit…</p>
          </motion.div>
        )}

        {/* ── Error ── */}
        {error && (
          <p className="text-center text-primary text-sm">{error}</p>
        )}

        {/* ── Results ── */}
        {result && photoSrc && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Score comparison */}
            <motion.div
              className="flex items-center justify-center gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ScoreRing score={result.overallScore} label="Before" color="#e94560" />
              <ArrowRight className="w-6 h-6 text-muted" />
              <ScoreRing score={result.glowedUpScore} label="After Glow-Up" color="#2ecc71" />
            </motion.div>

            {/* Before / After slider */}
            <motion.div
              className="max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div
                ref={sliderContainerRef}
                className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-xl cursor-ew-resize select-none touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
              >
                {/* "After" layer (full) — shows glowed-up description */}
                <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-card to-success/5 flex items-center justify-center p-6">
                  <div className="text-center space-y-3">
                    <Sparkles className="w-8 h-8 text-success mx-auto" />
                    <h3 className="text-lg font-bold text-foreground">Glowed Up ✨</h3>
                    <p className="text-muted text-sm leading-relaxed max-w-xs">
                      {result.summary}
                    </p>
                  </div>
                </div>

                {/* "Before" layer (clipped) — original photo */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                  }}
                >
                  <Image
                    src={photoSrc}
                    alt="Original outfit"
                    fill
                    className="object-cover"
                    sizes="512px"
                    unoptimized
                  />
                  {/* "Before" label */}
                  <div className="absolute top-3 left-3 bg-dark/70 backdrop-blur text-xs text-foreground px-2.5 py-1 rounded-full border border-border">
                    Before
                  </div>
                </div>

                {/* Slider handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-foreground/80 shadow-lg"
                  style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-foreground/90 flex items-center justify-center shadow-lg">
                    <span className="text-dark text-xs font-bold">↔</span>
                  </div>
                </div>

                {/* "After" label */}
                <div
                  className="absolute top-3 right-3 bg-success/20 backdrop-blur text-xs text-success px-2.5 py-1 rounded-full border border-success/30"
                  style={{
                    opacity: sliderPos < 85 ? 1 : 0,
                    transition: "opacity 0.2s",
                  }}
                >
                  After
                </div>
              </div>

              <p className="text-center text-muted text-xs mt-2">
                ← Drag the slider to compare →
              </p>
            </motion.div>

            {/* Improvement tips */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Improvement Tips
                <span className="text-muted text-sm font-normal ml-auto">
                  {result.tips.length} suggestions
                </span>
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                {result.tips.map((tip, idx) => {
                  const Icon = categoryIcon[tip.category] ?? Sparkles;
                  const applied = appliedTips.has(tip.id);
                  return (
                    <motion.div
                      key={tip.id}
                      className={`bg-card rounded-xl border p-4 transition-colors ${
                        applied ? "border-success/50 bg-success/5" : "border-border"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.08 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-dark/50 flex items-center justify-center flex-shrink-0 border border-border/50">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-foreground text-sm font-semibold">{tip.title}</h4>
                            <span
                              className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border ${impactColor[tip.impact]}`}
                            >
                              {tip.impact}
                            </span>
                          </div>
                          <p className="text-muted text-xs mt-1 leading-relaxed">
                            {tip.description}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleTip(tip.id)}
                          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            applied
                              ? "bg-success text-white"
                              : "bg-dark/50 text-muted hover:text-foreground border border-border/50"
                          }`}
                          aria-label={applied ? "Remove tip" : "Apply tip"}
                        >
                          {applied ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <X className="w-3 h-3 rotate-45" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Apply to wardrobe */}
            <motion.div
              className="flex justify-center pt-2 pb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-40"
                disabled={appliedTips.size === 0}
                onClick={() => {
                  // Future: POST to backend with applied tip IDs
                  alert(
                    `Applied ${appliedTips.size} tip(s) to your wardrobe! (wire up backend)`,
                  );
                }}
              >
                <Sparkles className="w-5 h-5" />
                Apply {appliedTips.size > 0 ? `${appliedTips.size} Tip${appliedTips.size > 1 ? "s" : ""}` : ""} to Wardrobe
              </button>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
