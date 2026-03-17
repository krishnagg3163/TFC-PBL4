import { useState, useCallback } from "react";

type SwipeDirection = "left" | "right" | "up";

export function useSwipe(onSwipe: (direction: SwipeDirection) => void) {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;

      const threshold = 50;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        onSwipe(diffX > 0 ? "right" : "left");
      } else if (diffY < -threshold) {
        onSwipe("up");
      }
    },
    [startX, startY, onSwipe]
  );

  return { handleTouchStart, handleTouchEnd };
}
