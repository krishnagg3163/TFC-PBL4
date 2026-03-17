"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Loader2, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/discover");
      router.refresh();
    }
  };

  const handleDemo = () => {
    setDemoLoading(true);
    setError("");
    signIn("credentials", {
      email: "test@tfc.com",
      password: "password123",
      callbackUrl: "/discover",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo / Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          T<span className="text-[#e94560]">F</span>C
        </h1>
        <p className="text-[#8899aa] text-sm mt-1">Tinder for Clothes</p>
      </div>

      <div className="bg-[#16213e] rounded-2xl border border-[#233554] p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
        <p className="text-[#8899aa] text-sm mb-6">
          Sign in to your account to continue
        </p>

        {/* Demo Login */}
        <button
          onClick={handleDemo}
          disabled={demoLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#e94560]/10 border border-[#e94560]/30 text-[#e94560] font-medium hover:bg-[#e94560]/20 transition-colors disabled:opacity-50"
        >
          {demoLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
          Demo Login
          <span className="text-xs text-[#8899aa] ml-1">(no account needed)</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#233554]" />
          <span className="text-xs text-[#8899aa] uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-[#233554]" />
        </div>

        {/* Credentials form */}
        <form onSubmit={handleCredentials} className="space-y-4">
          <div>
            <label className="block text-sm text-[#8899aa] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899aa]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#233554] text-white placeholder:text-[#556677] focus:outline-none focus:ring-2 focus:ring-[#e94560]/50 focus:border-[#e94560] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#8899aa] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899aa]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#233554] text-white placeholder:text-[#556677] focus:outline-none focus:ring-2 focus:ring-[#e94560]/50 focus:border-[#e94560] transition-colors"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#e94560] text-sm"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#e94560] text-white font-semibold hover:bg-[#d63851] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            Sign In
          </button>
        </form>

        <p className="text-center text-[#8899aa] text-sm mt-6">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-[#e94560] hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </motion.div>
  );
}
