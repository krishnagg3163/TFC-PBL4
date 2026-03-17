"use client";

import { X, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { SwipeDirection } from "@/types";

interface SwipeControlsProps {
  onSwipe: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

const buttonBase =
  "rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

export function SwipeControls({ onSwipe, disabled }: SwipeControlsProps) {
  return (
    <div className="flex items-center justify-center gap-5 mt-6">
      {/* Nope */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        className={`${buttonBase} w-16 h-16 bg-card border-2 border-primary/40 text-primary hover:bg-primary/10`}
        onClick={() => onSwipe("left")}
        disabled={disabled}
        aria-label="Pass"
      >
        <X className="w-7 h-7" strokeWidth={3} />
      </motion.button>

      {/* Super-like */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        className={`${buttonBase} w-12 h-12 bg-card border-2 border-warning/40 text-warning hover:bg-warning/10`}
        onClick={() => onSwipe("up")}
        disabled={disabled}
        aria-label="Super like"
      >
        <Star className="w-5 h-5 fill-warning" strokeWidth={2} />
      </motion.button>

      {/* Like */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        className={`${buttonBase} w-16 h-16 bg-card border-2 border-success/40 text-success hover:bg-success/10`}
        onClick={() => onSwipe("right")}
        disabled={disabled}
        aria-label="Like"
      >
        <Heart className="w-7 h-7" strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
