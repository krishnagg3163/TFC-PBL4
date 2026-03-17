"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Sparkles } from "lucide-react";
import type { OutfitSuggestion } from "@/types";

interface MatchModalProps {
  suggestion: OutfitSuggestion | null;
  onClose: () => void;
  onAddToWardrobe: (suggestion: OutfitSuggestion) => void;
}

export function MatchModal({ suggestion, onClose, onAddToWardrobe }: MatchModalProps) {
  // Close on escape
  useEffect(() => {
    if (!suggestion) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [suggestion, onClose]);

  return (
    <AnimatePresence>
      {suggestion && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm bg-card rounded-3xl overflow-hidden border border-border shadow-2xl"
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-dark/60 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header sparkle animation */}
            <div className="relative bg-gradient-to-br from-primary/20 via-card to-success/20 px-6 pt-8 pb-4 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/30">
                  <Heart className="w-10 h-10 text-white fill-white" />
                </div>
              </motion.div>

              <motion.h2
                className="text-2xl font-display font-black mt-4 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                It&apos;s a Match!
              </motion.h2>

              <motion.p
                className="text-muted text-sm mt-1"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                You liked this outfit suggestion
              </motion.p>
            </div>

            {/* Outfit preview */}
            <motion.div
              className="px-6 py-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-display font-bold text-foreground text-lg">
                {suggestion.name}
              </h3>
              <p className="text-muted text-sm mt-0.5">{suggestion.occasion}</p>

              {/* Item thumbnails */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {suggestion.items.map((item) => (
                  <div
                    key={item.id}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-border flex-shrink-0"
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="px-6 pb-6 flex gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-dark border border-border text-muted font-medium transition-colors hover:bg-card-hover hover:text-foreground"
              >
                Keep Swiping
              </button>
              <button
                onClick={() => {
                  onAddToWardrobe(suggestion);
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-medium flex items-center justify-center gap-2 transition-colors hover:bg-primary-hover"
              >
                <Sparkles className="w-4 h-4" />
                Save
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
