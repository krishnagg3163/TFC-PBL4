"use client";

import { useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import { Heart, X } from "lucide-react";
import type { ClothingItem } from "@/types";

// ── Public types ─────────────────────────────────────────

export type SwipeDir = "left" | "right";

export interface SwipeCardStackProps {
  /** Items to render (first = top of deck). At least 1 required. */
  items: ClothingItem[];
  /** Fires when the top card is fully swiped away. */
  onSwipe: (direction: SwipeDir, item: ClothingItem) => void;
}

// ── Constants ────────────────────────────────────────────

const SWIPE_THRESHOLD = 120;
const ROTATION_RANGE = 18;
const VISIBLE_CARDS = 3;

const SPRING = { type: "spring" as const, stiffness: 300, damping: 24 };

// ── Exit animations ──────────────────────────────────────

export const swipeExitVariants = {
  left: { x: -700, opacity: 0, rotate: -25, transition: { ...SPRING, duration: 0.45 } },
  right: { x: 700, opacity: 0, rotate: 25, transition: { ...SPRING, duration: 0.45 } },
  // kept for other consumers that still reference "up"
  up: { y: -700, opacity: 0, scale: 1.1, transition: { ...SPRING, duration: 0.45 } },
};

// ── Single draggable card (internal) ─────────────────────

interface CardProps {
  item: ClothingItem;
  stackIndex: number; // 0 = top
  onSwipeComplete: (dir: SwipeDir) => void;
}

function Card({ item, stackIndex, onSwipeComplete }: CardProps) {
  const isTop = stackIndex === 0;

  // Drag values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-350, 0, 350], [-ROTATION_RANGE, 0, ROTATION_RANGE]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  // Depth offsets for stacked cards behind the active one
  const scale = 1 - stackIndex * 0.05;
  const yOffset = stackIndex * 10;
  const rotateOffset = stackIndex * -1.5;

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipeComplete("right");
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipeComplete("left");
    }
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : rotateOffset,
        zIndex: VISIBLE_CARDS - stackIndex,
      }}
      initial={{ scale, y: yOffset, opacity: isTop ? 1 : 0.92 - stackIndex * 0.08 }}
      animate={{
        scale,
        y: yOffset,
        opacity: isTop ? 1 : 0.92 - stackIndex * 0.08,
        rotate: isTop ? 0 : rotateOffset,
        transition: SPRING,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#233554] shadow-2xl bg-[#16213e]">
        {/* ── Image ── */}
        <div className="relative w-full h-[68%]">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 420px) 100vw, 380px"
            priority={isTop}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16213e] via-transparent to-transparent" />
        </div>

        {/* ── Like overlay ── */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl flex items-center justify-center"
          style={{ opacity: likeOpacity }}
        >
          <div className="absolute inset-0 bg-green-500/20 rounded-2xl" />
          <div className="relative border-[5px] border-green-400 rounded-xl px-6 py-3 rotate-[-15deg]">
            <Heart className="w-12 h-12 text-green-400 fill-green-400" />
          </div>
        </motion.div>

        {/* ── Dislike overlay ── */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl flex items-center justify-center"
          style={{ opacity: nopeOpacity }}
        >
          <div className="absolute inset-0 bg-[#e94560]/20 rounded-2xl" />
          <div className="relative border-[5px] border-[#e94560] rounded-xl px-6 py-3 rotate-[15deg]">
            <X className="w-12 h-12 text-[#e94560]" />
          </div>
        </motion.div>

        {/* ── Info section ── */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10 bg-gradient-to-t from-[#16213e] from-50% to-transparent">
          <h3 className="text-xl font-bold text-white truncate">{item.name}</h3>

          {item.brand && (
            <p className="text-[#8899aa] text-sm mt-0.5">{item.brand}</p>
          )}

          <span className="inline-block mt-2.5 text-xs font-medium uppercase tracking-wide px-3 py-1 rounded-full bg-[#e94560]/15 text-[#e94560] border border-[#e94560]/30">
            {item.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── SwipeCard stack (public component) ───────────────────

export function SwipeCard({ items, onSwipe }: SwipeCardStackProps) {
  const [deck, setDeck] = useState(items);

  function handleSwipeComplete(dir: SwipeDir) {
    const swiped = deck[0];
    if (!swiped) return;

    onSwipe(dir, swiped);

    // Remove the top card after a short delay so exit animation plays
    setTimeout(() => setDeck((prev) => prev.slice(1)), 300);
  }

  const visibleCards = deck.slice(0, VISIBLE_CARDS);

  if (visibleCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] text-center">
        <div className="text-6xl mb-4">👗</div>
        <h3 className="text-xl font-bold text-white mb-2">No more items!</h3>
        <p className="text-[#8899aa] text-sm max-w-[260px]">
          Check back later for new clothing to swipe through.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-[340px] sm:w-[380px] h-[520px]">
      <AnimatePresence>
        {/* Render bottom → top so the topmost card is painted last */}
        {[...visibleCards].reverse().map((item, reverseIdx) => {
          const stackIndex = visibleCards.length - 1 - reverseIdx;
          return (
            <Card
              key={item.id}
              item={item}
              stackIndex={stackIndex}
              onSwipeComplete={handleSwipeComplete}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
