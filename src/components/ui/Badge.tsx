export type BadgeCategory =
  | "Tops"
  | "Bottoms"
  | "Shoes"
  | "Bags"
  | "Hats"
  | "Accessories"
  | "Outerwear"
  | "Dresses"
  | "Activewear";

export interface BadgeProps {
  category: BadgeCategory | (string & {});
  size?: "sm" | "md";
  className?: string;
}

const categoryEmoji: Record<string, string> = {
  Tops: "👕",
  Bottoms: "👖",
  Shoes: "👟",
  Bags: "👜",
  Hats: "🧢",
  Accessories: "💍",
  Outerwear: "🧥",
  Dresses: "👗",
  Activewear: "🏃",
};

const categoryColor: Record<string, string> = {
  Tops: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Bottoms: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  Shoes: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Bags: "bg-pink-500/15 text-pink-400 border-pink-500/25",
  Hats: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  Accessories: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Outerwear: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Dresses: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  Activewear: "bg-orange-500/15 text-orange-400 border-orange-500/25",
};

const defaultColor = "bg-[#e94560]/15 text-[#e94560] border-[#e94560]/25";

const sizes: Record<string, string> = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-3 py-1 gap-1.5",
};

export function Badge({
  category,
  size = "sm",
  className = "",
}: BadgeProps) {
  const emoji = categoryEmoji[category] ?? "🏷️";
  const color = categoryColor[category] ?? defaultColor;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${color} ${sizes[size]} ${className}`}
    >
      <span>{emoji}</span>
      {category}
    </span>
  );
}
