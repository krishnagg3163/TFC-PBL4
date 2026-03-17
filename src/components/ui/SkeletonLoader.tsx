export interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

const roundedMap: Record<string, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

export function SkeletonLoader({
  width,
  height,
  rounded = "xl",
  className = "",
}: SkeletonLoaderProps) {
  return (
    <div
      className={`animate-pulse bg-[#233554]/60 ${roundedMap[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
}

/* ── Preset compositions ── */

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-[#16213e] border border-[#233554] rounded-2xl p-4 space-y-3 ${className}`}
    >
      <SkeletonLoader height="160px" rounded="xl" className="w-full" />
      <SkeletonLoader height="14px" rounded="md" className="w-3/4" />
      <SkeletonLoader height="12px" rounded="md" className="w-1/2" />
      <div className="flex gap-2 pt-1">
        <SkeletonLoader height="24px" rounded="full" className="w-16" />
        <SkeletonLoader height="24px" rounded="full" className="w-12" />
      </div>
    </div>
  );
}

export function SkeletonImage({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <SkeletonLoader rounded="2xl" className="w-full h-full" />
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}
