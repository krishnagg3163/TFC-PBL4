"use client";

import { useCallback } from "react";
import { SwipeCard, type SwipeDir } from "./SwipeCard";
import { SwipeControls } from "./SwipeControls";
import type { OutfitSuggestion, ClothingItem, SwipeAction } from "@/types";

interface SwipeDeckProps {
  suggestions: OutfitSuggestion[];
  onSwipeAction: (action: SwipeAction) => void;
  onMatch: (suggestion: OutfitSuggestion) => void;
  onEmpty: () => void;
}

export function SwipeDeck({ suggestions, onSwipeAction, onMatch, onEmpty }: SwipeDeckProps) {
  // Flatten each suggestion's first item into the card deck
  const cardItems: ClothingItem[] = suggestions
    .map((s) => s.items[0])
    .filter(Boolean);

  // Map item id → parent suggestion for match lookup
  const itemToSuggestion = new Map(
    suggestions.map((s) => [s.items[0]?.id, s] as const),
  );

  const handleSwipe = useCallback(
    (direction: SwipeDir, item: ClothingItem) => {
      const action: SwipeAction = {
        id: `${item.id}-${Date.now()}`,
        userId: "",
        itemId: item.id,
        direction,
        item,
        timestamp: new Date().toISOString(),
      };
      onSwipeAction(action);

      if (direction === "right") {
        const suggestion = itemToSuggestion.get(item.id);
        if (suggestion) onMatch(suggestion);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSwipeAction, onMatch],
  );

  if (cardItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] text-center">
        <div className="text-6xl mb-4">👗</div>
        <h3 className="text-xl font-bold text-white mb-2">
          You&apos;ve seen them all!
        </h3>
        <p className="text-[#8899aa] text-sm max-w-[260px]">
          Check back later for new outfit suggestions or adjust your style preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <SwipeCard items={cardItems} onSwipe={handleSwipe} />

      <SwipeControls
        onSwipe={(dir) => {
          if (cardItems[0]) handleSwipe(dir === "up" ? "right" : dir, cardItems[0]);
        }}
        disabled={cardItems.length === 0}
      />

      <p className="text-[#8899aa] text-xs mt-4">
        {cardItems.length} remaining
      </p>
    </div>
  );
}
