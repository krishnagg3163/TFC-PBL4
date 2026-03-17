export interface RatingStarsProps {
  rating: number;          // 0 – 5 (supports halves, e.g. 3.5)
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizeStyles: Record<string, { star: string; text: string }> = {
  sm: { star: "text-sm", text: "text-xs" },
  md: { star: "text-base", text: "text-sm" },
  lg: { star: "text-xl", text: "text-base" },
};

export function RatingStars({
  rating,
  maxStars = 5,
  size = "md",
  showValue = true,
  className = "",
}: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(rating, maxStars));
  const fullStars = Math.floor(clamped);
  const hasHalf = clamped - fullStars >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalf ? 1 : 0);
  const { star, text } = sizeStyles[size];

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${clamped} out of ${maxStars} stars`}
    >
      {Array.from({ length: fullStars }, (_, i) => (
        <span key={`f-${i}`} className={star}>⭐</span>
      ))}
      {hasHalf && <span className={`${star} opacity-60`}>⭐</span>}
      {Array.from({ length: emptyStars }, (_, i) => (
        <span key={`e-${i}`} className={`${star} opacity-20 grayscale`}>⭐</span>
      ))}
      {showValue && (
        <span className={`ml-1 font-medium text-[#8899aa] ${text}`}>
          {clamped.toFixed(1)}
        </span>
      )}
    </span>
  );
}
