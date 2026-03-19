"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
  AnimatePresence,
} from "framer-motion";
import { Heart, X, Loader2, ShirtIcon, Sparkles } from "lucide-react";

const WARDROBE_API = "http://localhost:5000/api/wardrobe";
const OCCASION_TABS = ["Casual", "Formal", "Party"] as const;
type OccasionTab = (typeof OCCASION_TABS)[number];
const OCCASION_FILTER_MAP: Record<OccasionTab, string> = {
  Casual: "Casuals",
  Formal: "Formals",
  Party: "Party",
};

// ── Types ────────────────────────────────────────────────

interface WardrobeItem {
  _id: string;
  name: string;
  category: string;
  color: string;
  occasionTags?: string[];
  imageBase64?: string;
  imageUrl?: string;
}

interface OutfitCombo {
  id: string;
  name: string;
  blazer?: WardrobeItem;
  top: WardrobeItem;
  bottom: WardrobeItem;
  shoes: WardrobeItem;
}

// ── Build combos ─────────────────────────────────────────

function buildThreePieceCombos(items: WardrobeItem[]): OutfitCombo[] {
  const tops = items.filter((i) => i.category?.toLowerCase() === "tops");
  const bottoms = items.filter((i) => i.category?.toLowerCase() === "bottoms");
  const shoes = items.filter((i) => i.category?.toLowerCase() === "shoes");

  if (tops.length === 0 || bottoms.length === 0 || shoes.length === 0) return [];

  const combos: OutfitCombo[] = [];
  let idx = 0;
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        combos.push({
          id: `combo-${idx++}`,
          name: `${top.name} + ${bottom.name}`,
          top,
          bottom,
          shoes: shoe,
        });
      }
    }
  }

  // Shuffle so it's not always the same order
  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combos[i], combos[j]] = [combos[j], combos[i]];
  }

  return combos;
}

function buildFormalCombos(items: WardrobeItem[]): { combos: OutfitCombo[]; hasBlazer: boolean } {
  const blazers = items.filter(
    (i) =>
      i.category?.toLowerCase() === "blazer" ||
      (i.category?.toLowerCase() === "tops" && i.name?.toLowerCase().includes("blazer")),
  );

  const formalBlazer = blazers.filter((i) => i.occasionTags?.includes("Formals"));
  const formalTops = items.filter(
    (i) =>
      i.category?.toLowerCase() === "tops" &&
      i.occasionTags?.includes("Formals") &&
      !i.name?.toLowerCase().includes("blazer"),
  );
  const formalBottoms = items.filter(
    (i) => i.category?.toLowerCase() === "bottoms" && i.occasionTags?.includes("Formals"),
  );
  const formalShoes = items.filter(
    (i) => i.category?.toLowerCase() === "shoes" && i.occasionTags?.includes("Formals"),
  );

  if (formalTops.length === 0 || formalBottoms.length === 0 || formalShoes.length === 0) {
    return { combos: [], hasBlazer: formalBlazer.length > 0 };
  }

  if (formalBlazer.length === 0) {
    return { combos: [], hasBlazer: false };
  }

  const combos: OutfitCombo[] = [];
  let idx = 0;
  for (const blazer of formalBlazer) {
    for (const top of formalTops) {
      for (const bottom of formalBottoms) {
        for (const shoe of formalShoes) {
          combos.push({
            id: `formal-combo-${idx++}`,
            name: `${blazer.name} + ${top.name} + ${bottom.name}`,
            blazer,
            top,
            bottom,
            shoes: shoe,
          });
        }
      }
    }
  }

  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combos[i], combos[j]] = [combos[j], combos[i]];
  }

  return { combos, hasBlazer: true };
}

function getImgSrc(item: WardrobeItem): string {
  return item.imageBase64 || item.imageUrl || "";
}

// ── Swipe Card ───────────────────────────────────────────

const SWIPE_THRESHOLD = 120;

function OutfitSwipeCard({
  combo,
  stackIndex,
  onSwipeComplete,
}: {
  combo: OutfitCombo;
  stackIndex: number;
  onSwipeComplete: (dir: "left" | "right") => void;
}) {
  const isTop = stackIndex === 0;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-350, 0, 350], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 10;

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipeComplete("right");
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipeComplete("left");
  }

  const isFormalFourPiece = Boolean(combo.blazer);

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : stackIndex * -1.5,
        zIndex: 3 - stackIndex,
      }}
      initial={{ scale, y: yOffset, opacity: isTop ? 1 : 0.92 - stackIndex * 0.08 }}
      animate={{
        scale,
        y: yOffset,
        opacity: isTop ? 1 : 0.92 - stackIndex * 0.08,
        transition: { type: "spring", stiffness: 300, damping: 24 },
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#233554] shadow-2xl bg-[#16213e]">
        {/* Outfit collage */}
        {isFormalFourPiece ? (
          <div className="relative w-full h-[72%] grid grid-cols-2 grid-rows-3 gap-1 p-2 bg-[#1a1a2e]">
            <div className="relative col-span-2 rounded-xl overflow-hidden border border-[#233554]">
              {combo.blazer && getImgSrc(combo.blazer) ? (
                <Image
                  src={getImgSrc(combo.blazer)}
                  alt={combo.blazer.name}
                  fill
                  className="object-cover"
                  sizes="180px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#16213e]">
                  <ShirtIcon className="w-8 h-8 text-[#233554]" />
                </div>
              )}
              <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                Blazer
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-[#233554]">
              {getImgSrc(combo.top) ? (
                <Image
                  src={getImgSrc(combo.top)}
                  alt={combo.top.name}
                  fill
                  className="object-cover"
                  sizes="180px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#16213e]">
                  <ShirtIcon className="w-8 h-8 text-[#233554]" />
                </div>
              )}
              <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                Top
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-[#233554]">
              {getImgSrc(combo.bottom) ? (
                <Image
                  src={getImgSrc(combo.bottom)}
                  alt={combo.bottom.name}
                  fill
                  className="object-cover"
                  sizes="180px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#16213e]">
                  <ShirtIcon className="w-8 h-8 text-[#233554]" />
                </div>
              )}
              <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                Bottom
              </span>
            </div>

            <div className="relative col-span-2 rounded-xl overflow-hidden border border-[#233554]">
              {getImgSrc(combo.shoes) ? (
                <Image
                  src={getImgSrc(combo.shoes)}
                  alt={combo.shoes.name}
                  fill
                  className="object-cover"
                  sizes="360px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#16213e]">
                  <ShirtIcon className="w-8 h-8 text-[#233554]" />
                </div>
              )}
              <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                Shoes
              </span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[72%] grid grid-cols-2 grid-rows-2 gap-1 p-2 bg-[#1a1a2e]">
            {/* Top — top left */}
            <div className="relative rounded-xl overflow-hidden border border-[#233554]">
              {getImgSrc(combo.top) ? (
                <Image
                  src={getImgSrc(combo.top)}
                  alt={combo.top.name}
                  fill
                  className="object-cover"
                  sizes="180px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#16213e]">
                  <ShirtIcon className="w-8 h-8 text-[#233554]" />
                </div>
              )}
              <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                👕 Top
              </span>
            </div>

            {/* Bottom — top right */}
            <div className="relative rounded-xl overflow-hidden border border-[#233554]">
              {getImgSrc(combo.bottom) ? (
                <Image
                  src={getImgSrc(combo.bottom)}
                  alt={combo.bottom.name}
                  fill
                  className="object-cover"
                  sizes="180px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#16213e]">
                  <ShirtIcon className="w-8 h-8 text-[#233554]" />
                </div>
              )}
              <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                👖 Bottom
              </span>
            </div>

            {/* Shoes — bottom center (spans 2 cols) */}
            <div className="relative col-span-2 rounded-xl overflow-hidden border border-[#233554]">
              {getImgSrc(combo.shoes) ? (
                <Image
                  src={getImgSrc(combo.shoes)}
                  alt={combo.shoes.name}
                  fill
                  className="object-cover"
                  sizes="360px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#16213e]">
                  <ShirtIcon className="w-8 h-8 text-[#233554]" />
                </div>
              )}
              <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                👟 Shoes
              </span>
            </div>
          </div>
        )}

        {/* Like overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl flex items-center justify-center"
          style={{ opacity: likeOpacity }}
        >
          <div className="absolute inset-0 bg-green-500/20 rounded-2xl" />
          <div className="relative border-[5px] border-green-400 rounded-xl px-6 py-3 rotate-[-15deg]">
            <Heart className="w-12 h-12 text-green-400 fill-green-400" />
          </div>
        </motion.div>

        {/* Nope overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl flex items-center justify-center"
          style={{ opacity: nopeOpacity }}
        >
          <div className="absolute inset-0 bg-[#e94560]/20 rounded-2xl" />
          <div className="relative border-[5px] border-[#e94560] rounded-xl px-6 py-3 rotate-[15deg]">
            <X className="w-12 h-12 text-[#e94560]" />
          </div>
        </motion.div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-2">
          <h3 className="text-lg font-bold text-white truncate">{combo.name}</h3>
          <p className="text-[#8899aa] text-xs mt-0.5">
            {combo.blazer ? `${combo.blazer.name} · ` : ""}
            {combo.top.name} · {combo.bottom.name} · {combo.shoes.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────

export default function DiscoverPage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [combos, setCombos] = useState<OutfitCombo[]>([]);
  const [totalCombos, setTotalCombos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savedCount, setSavedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [selectedOccasion, setSelectedOccasion] = useState<OccasionTab>("Casual");
  const [showFormalBlazerHint, setShowFormalBlazerHint] = useState(false);

  const occasionFilteredItems = useMemo(() => {
    const selectedTag = OCCASION_FILTER_MAP[selectedOccasion];
    return items.filter((item) => {
      return Array.isArray(item.occasionTags) && item.occasionTags.includes(selectedTag);
    });
  }, [items, selectedOccasion]);

  const occasionTops = useMemo(
    () => occasionFilteredItems.filter((i) => i.category?.toLowerCase() === "tops"),
    [occasionFilteredItems],
  );

  const occasionBottoms = useMemo(
    () => occasionFilteredItems.filter((i) => i.category?.toLowerCase() === "bottoms"),
    [occasionFilteredItems],
  );

  const occasionShoes = useMemo(
    () => occasionFilteredItems.filter((i) => i.category?.toLowerCase() === "shoes"),
    [occasionFilteredItems],
  );

  const hasOccasionCategories =
    occasionTops.length > 0 && occasionBottoms.length > 0 && occasionShoes.length > 0;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(WARDROBE_API);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const fetched: WardrobeItem[] = data.items || [];
        setItems(fetched);
      } catch {
        setItems([]);
        setCombos([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedOccasion === "Formal") {
      const { combos: formalCombos, hasBlazer } = buildFormalCombos(items);
      setCombos(formalCombos);
      setTotalCombos(formalCombos.length);
      setShowFormalBlazerHint(!hasBlazer);
    } else {
      const allOccasionCombos = buildThreePieceCombos(occasionFilteredItems);
      setCombos(allOccasionCombos);
      setTotalCombos(allOccasionCombos.length);
      setShowFormalBlazerHint(false);
    }
    setSavedCount(0);
    setSkippedCount(0);
  }, [items, occasionFilteredItems, selectedOccasion]);

  const currentIndex = totalCombos - combos.length;

  const handleSwipe = useCallback(
    async (dir: "left" | "right") => {
      if (combos.length === 0) return;
      const combo = combos[0];

      if (dir === "right") {
        setSavedCount((c) => c + 1);
        try {
          await fetch(`${WARDROBE_API}/save-outfit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: combo.name,
              topId: combo.top._id,
              bottomId: combo.bottom._id,
              shoesId: combo.shoes._id,
            }),
          });
        } catch {
          // Silently fail
        }
      } else {
        setSkippedCount((c) => c + 1);
      }

      setTimeout(() => setCombos((prev) => prev.slice(1)), 300);
    },
    [combos],
  );

  const visibleCombos = combos.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#1a1a2e]/80 backdrop-blur-md border-b border-[#233554]">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            <span className="text-[#e94560]">TFC</span>{" "}
            <span className="text-white">Discover</span>
          </h1>
          <div className="flex items-center gap-3 text-xs text-[#8899aa]">
            {totalCombos > 0 && (
              <span className="px-2 py-1 rounded-lg bg-[#16213e] border border-[#233554] font-medium">
                {currentIndex + 1} of {totalCombos}
              </span>
            )}
            {(savedCount > 0 || skippedCount > 0) && (
              <>
                <span>{savedCount} ❤️</span>
                <span>{skippedCount} ✕</span>
              </>
            )}
          </div>
        </div>

        {/* Occasion tabs */}
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {OCCASION_TABS.map((tab) => {
              const isActive = selectedOccasion === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedOccasion(tab)}
                  className={`py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? "bg-[#e94560] text-white font-bold"
                      : "bg-[#16213e] text-[#8899aa] font-medium"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-md mx-auto px-4 pt-6 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[520px]">
            <Loader2 className="w-10 h-10 text-[#e94560] animate-spin" />
            <p className="text-[#8899aa] text-sm mt-4">Loading your outfits...</p>
          </div>
        ) : !hasOccasionCategories ? (
          <div className="flex flex-col items-center justify-center h-[520px] text-center">
            <ShirtIcon className="w-16 h-16 text-[#233554] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Not enough {selectedOccasion} items.
            </h3>
            <p className="text-[#8899aa] text-sm max-w-xs mb-6">
              You need at least 1 Top, 1 Bottom and 1 Shoes tagged as {selectedOccasion} to see combinations.
            </p>
            <Link
              href="/wardrobe"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-medium hover:bg-[#d13a52] transition-colors"
            >
              <ShirtIcon className="w-4 h-4" />
              Go to Wardrobe
            </Link>
          </div>
        ) : visibleCombos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[520px] text-center">
            <Sparkles className="w-16 h-16 text-[#e94560] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              You&apos;ve seen them all!
            </h3>
            <p className="text-[#8899aa] text-sm max-w-xs mb-2">
              Reviewed all {totalCombos} outfit{totalCombos !== 1 && "s"} · Saved {savedCount} · Skipped {skippedCount}
            </p>
            <button
              onClick={() => {
                if (selectedOccasion === "Formal") {
                  const { combos: formalCombos, hasBlazer } = buildFormalCombos(items);
                  setCombos(formalCombos);
                  setTotalCombos(formalCombos.length);
                  setShowFormalBlazerHint(!hasBlazer);
                } else {
                  const allCombos = buildThreePieceCombos(occasionFilteredItems);
                  setCombos(allCombos);
                  setTotalCombos(allCombos.length);
                  setShowFormalBlazerHint(false);
                }
                setSavedCount(0);
                setSkippedCount(0);
              }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-medium hover:bg-[#d13a52] transition-colors"
            >
              Shuffle Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="w-full text-sm text-[#8899aa] mb-3 text-center">
              Showing <span className="text-white font-semibold">{totalCombos}</span> combinations for <span className="text-white font-semibold">{selectedOccasion}</span>
            </p>

            {selectedOccasion === "Formal" && showFormalBlazerHint && (
              <p className="w-full text-xs text-[#f59e0b] mb-3 text-center">
                Add a Blazer for complete formal looks!
              </p>
            )}

            {/* Progress bar */}
            <div className="w-full mb-4">
              <div className="w-full h-1.5 rounded-full bg-[#233554] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#e94560] transition-all duration-300"
                  style={{ width: `${totalCombos > 0 ? ((currentIndex + 1) / totalCombos) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="relative w-[340px] sm:w-[380px] h-[520px]">
              <AnimatePresence>
                {[...visibleCombos].reverse().map((combo, reverseIdx) => {
                  const stackIndex = visibleCombos.length - 1 - reverseIdx;
                  return (
                    <OutfitSwipeCard
                      key={combo.id}
                      combo={combo}
                      stackIndex={stackIndex}
                      onSwipeComplete={handleSwipe}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 mt-6">
              <button
                onClick={() => handleSwipe("left")}
                className="w-14 h-14 rounded-full bg-[#16213e] border-2 border-[#e94560] flex items-center justify-center text-[#e94560] hover:bg-[#e94560] hover:text-white transition-colors"
              >
                <X className="w-7 h-7" />
              </button>
              <button
                onClick={() => handleSwipe("right")}
                className="w-14 h-14 rounded-full bg-[#16213e] border-2 border-green-400 flex items-center justify-center text-green-400 hover:bg-green-400 hover:text-white transition-colors"
              >
                <Heart className="w-7 h-7" />
              </button>
            </div>

            <p className="text-[#8899aa] text-xs mt-4">
              {combos.length} outfit{combos.length !== 1 && "s"} remaining
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
