"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from "framer-motion";
import {
  Shirt,
  Sparkles,
  Search,
  Star,
  Zap,
  Shuffle,
  ArrowRight,
  ChevronDown,
  Play,
  Upload,
  Wand2,
  Heart,
} from "lucide-react";

/* ─── Animated section wrapper (IntersectionObserver) ─── */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Mock swipe cards for hero ─── */

const mockCards = [
  { color: "from-rose-600 to-pink-500", label: "Vintage Jacket", tag: "🧥 Outerwear" },
  { color: "from-violet-600 to-indigo-500", label: "Pleated Skirt", tag: "👗 Bottoms" },
  { color: "from-amber-500 to-orange-500", label: "Retro Sneakers", tag: "👟 Shoes" },
];

const cardVariants: Variants = {
  stack: (i: number) => ({
    y: i * -12,
    scale: 1 - i * 0.05,
    rotate: i === 0 ? 0 : i % 2 === 0 ? 3 : -3,
    opacity: 1 - i * 0.15,
  }),
};

function SwipeMockup() {
  return (
    <div className="relative w-[280px] h-[380px] sm:w-[320px] sm:h-[420px]">
      {[...mockCards].reverse().map((card, idx) => {
        const i = mockCards.length - 1 - idx;
        return (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="stack"
            animate="stack"
            whileHover={i === 0 ? { rotate: 6, x: 30 } : undefined}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${card.color} shadow-2xl cursor-grab`}
            style={{ zIndex: mockCards.length - i }}
          >
            <div className="absolute inset-0 flex flex-col justify-end p-6 rounded-3xl bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <span className="text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 w-fit mb-2">
                {card.tag}
              </span>
              <h3 className="text-xl font-bold text-white">{card.label}</h3>
            </div>
            {/* Swipe indicators */}
            {i === 0 && (
              <>
                <div className="absolute top-6 left-6 border-2 border-green-400 text-green-400 rounded-lg px-3 py-1 text-sm font-bold rotate-[-12deg] opacity-0 hover:opacity-100 transition-opacity">
                  LIKE
                </div>
                <div className="absolute top-6 right-6 border-2 border-red-400 text-red-400 rounded-lg px-3 py-1 text-sm font-bold rotate-[12deg] opacity-0 hover:opacity-100 transition-opacity">
                  NOPE
                </div>
              </>
            )}
          </motion.div>
        );
      })}
      {/* Floating hearts */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-[#e94560] flex items-center justify-center shadow-lg shadow-[#e94560]/30"
      >
        <Heart className="w-5 h-5 text-white fill-white" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-[#2ecc71] flex items-center justify-center shadow-lg shadow-[#2ecc71]/30"
      >
        <Star className="w-4 h-4 text-white fill-white" />
      </motion.div>
    </div>
  );
}

/* ─── Feature data ─── */

const features = [
  {
    icon: Shirt,
    title: "Digital Wardrobe",
    desc: "Upload and organize every piece you own. Your closet, always in your pocket.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Sparkles,
    title: "AI Stylist",
    desc: "Chat with your personal AI stylist who knows your style DNA inside-out.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: Search,
    title: "Outfit Finder",
    desc: "Snap a photo of any outfit and find where to buy every piece instantly.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: Star,
    title: "Rate Outfit",
    desc: "Get honest AI-powered ratings and actionable feedback on your looks.",
    gradient: "from-yellow-500/20 to-lime-500/20",
    iconColor: "text-yellow-400",
  },
  {
    icon: Zap,
    title: "Glow Up",
    desc: "Upload an outfit photo and receive specific tips to level it up.",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400",
  },
  {
    icon: Shuffle,
    title: "Mix & Match",
    desc: "AI-generated outfit combos from your wardrobe you never thought of.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
];

/* ─── Steps data ─── */

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload Your Wardrobe",
    desc: "Take photos or upload images of your clothing items to build your digital closet.",
  },
  {
    num: "02",
    icon: Wand2,
    title: "Get AI Suggestions",
    desc: "Our AI analyzes your style, the weather, and the occasion to create perfect outfits.",
  },
  {
    num: "03",
    icon: Heart,
    title: "Swipe & Save",
    desc: "Swipe right on outfits you love, build your lookbook, and never stress about dressing again.",
  },
];

/* ─── Page ─── */

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <div className="bg-[#1a1a2e] text-white overflow-x-hidden">
      {/* ════════ HERO ════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center"
      >
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#e94560]/10 blur-[120px]" />
          <div className="absolute -bottom-60 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Left — copy */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#e94560] bg-[#e94560]/10 border border-[#e94560]/20 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5" /> AI-Powered Fashion
              </span>
              <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                Swipe
                <br />
                Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] to-[#ff6b81]">
                  Style
                </span>
              </h1>
                <p className="text-[#8899aa] text-base mt-3 font-medium tracking-wide">
                  <span className="text-white">TFC</span> — Tinder for Clothes
                </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-lg text-[#8899aa] max-w-md leading-relaxed"
            >
              Discover outfits you&apos;ll love, curated by AI.
              Build your dream wardrobe one swipe at a time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/discover"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#e94560] text-white font-semibold text-lg shadow-lg shadow-[#e94560]/25 hover:bg-[#d63851] transition-all"
              >
                Start Swiping
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#16213e] border border-[#233554] text-white font-semibold text-lg hover:bg-[#1a2745] transition-colors"
              >
                Sign In
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 pt-2"
            >
              <div className="flex -space-x-2">
                {["bg-rose-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500"].map(
                  (bg, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${bg} border-2 border-[#1a1a2e] flex items-center justify-center text-[10px] font-bold`}
                    >
                      {String.fromCodePoint(0x1f60a + i)}
                    </div>
                  ),
                )}
              </div>
              
            </motion.div>
          </div>

          {/* Right — mock swipe cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <SwipeMockup />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#8899aa]"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="relative py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="text-sm font-medium text-[#e94560] uppercase tracking-widest">
              Features
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mt-3">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] to-[#ff6b81]">
                Slay
              </span>
            </h2>
            <p className="text-[#8899aa] mt-4 max-w-lg mx-auto">
              Six powerful tools designed to transform how you dress, shop, and express yourself.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={idx * 0.08}>
                  <div className="group relative bg-[#16213e]/80 border border-[#233554] rounded-2xl p-6 hover:border-[#e94560]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 h-full">
                    {/* Glow bg */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-[#1a1a2e] border border-[#233554] flex items-center justify-center mb-4">
                        <Icon className={`w-6 h-6 ${f.iconColor}`} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {f.title}
                      </h3>
                      <p className="text-sm text-[#8899aa] leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="relative py-28 px-6">
        {/* Subtle divider glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#233554] to-transparent" />

        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="text-sm font-medium text-[#e94560] uppercase tracking-widest">
              How It Works
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mt-3">
              Three Steps to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] to-[#ff6b81]">
                Your Best Look
              </span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.num} delay={idx * 0.12}>
                  <div className="relative text-center">
                    {/* Connector line */}
                    {idx < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#233554] to-transparent" />
                    )}
                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#e94560]/20 to-[#e94560]/5 border border-[#e94560]/20 mb-5">
                      <Icon className="w-8 h-8 text-[#e94560]" />
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#e94560] text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-[#e94560]/30">
                        {s.num.replace("0", "")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-[#8899aa] leading-relaxed max-w-xs mx-auto">
                      {s.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ DEMO VIDEO PLACEHOLDER ════════ */}
      <section className="relative py-28 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#233554] to-transparent" />

        <Reveal className="max-w-4xl mx-auto text-center">
          <span className="text-sm font-medium text-[#e94560] uppercase tracking-widest">
            See It In Action
          </span>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mt-3 mb-12">
            Watch the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] to-[#ff6b81]">
              Magic
            </span>
          </h2>

          <div className="relative aspect-video rounded-3xl overflow-hidden border border-[#233554] bg-[#16213e] shadow-2xl shadow-black/30 group cursor-pointer">
            {/* Placeholder gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#16213e] via-[#1a1a2e] to-[#0f3460]" />

            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 rounded-full bg-[#e94560] flex items-center justify-center shadow-xl shadow-[#e94560]/30 group-hover:shadow-[#e94560]/50 transition-shadow"
              >
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </motion.div>
              <p className="text-[#8899aa] text-sm font-medium">
                Demo video coming soon
              </p>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="relative py-28 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#233554] to-transparent" />

        <Reveal className="max-w-2xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Ready to Transform
            <br />
            Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e94560] to-[#ff6b81]">
              Wardrobe?
            </span>
          </h2>
          <p className="text-[#8899aa] text-lg mb-10 max-w-md mx-auto">
            Join thousands of fashion lovers who swipe their way to better outfits every day.
          </p>
          <Link
            href="/discover"
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-[#e94560] text-white font-semibold text-lg shadow-lg shadow-[#e94560]/25 hover:bg-[#d63851] transition-all"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-[#233554] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#8899aa]">
          <p className="font-semibold text-white">
            T<span className="text-[#e94560]">F</span>C
          </p>
          <p>&copy; {new Date().getFullYear()} Tinder for Clothes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
