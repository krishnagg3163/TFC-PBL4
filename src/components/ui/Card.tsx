"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

export interface CardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings: Record<string, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  hover = true,
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.35)" } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`bg-[#16213e] border border-[#233554] rounded-2xl transition-colors hover:border-[#2a4060] ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
