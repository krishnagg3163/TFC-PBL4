"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserPlus, Loader2, Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Try backend registration first
      const res = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Registration failed");
      }
    } catch {
      // Backend unavailable — store in localStorage as fallback
      const localUsers = JSON.parse(localStorage.getItem("tfc_users") || "[]");
      const exists = localUsers.some((u: { email: string }) => u.email === email);
      if (exists) {
        setLoading(false);
        setError("An account with this email already exists");
        return;
      }
      localUsers.push({ name, email, password, createdAt: new Date().toISOString() });
      localStorage.setItem("tfc_users", JSON.stringify(localUsers));
    }

    // Auto sign-in after registration
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      // If credentials provider doesn't know this user yet, just redirect to login
      router.push("/login");
    } else {
      router.push("/discover");
      router.refresh();
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: "test@tfc.com",
      password: "password123",
      redirect: false,
    });

    setDemoLoading(false);

    if (res?.error) {
      setError("Demo login failed");
    } else {
      router.push("/discover");
      router.refresh();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          T<span className="text-[#e94560]">F</span>C
        </h1>
        <p className="text-[#8899aa] text-sm mt-1">Tinder for Clothes</p>
      </div>

      <div className="bg-[#16213e] rounded-2xl border border-[#233554] p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-1">Create account</h2>
        <p className="text-[#8899aa] text-sm mb-6">
          Join TFC and build your perfect wardrobe
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
          <span className="text-xs text-[#8899aa] ml-1">(skip registration)</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#233554]" />
          <span className="text-xs text-[#8899aa] uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-[#233554]" />
        </div>

        {/* Register form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-[#8899aa] mb-1.5">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899aa]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#233554] text-white placeholder:text-[#556677] focus:outline-none focus:ring-2 focus:ring-[#e94560]/50 focus:border-[#e94560] transition-colors"
              />
            </div>
          </div>

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
            <label className="block text-sm text-[#8899aa] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899aa]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
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
              <UserPlus className="w-5 h-5" />
            )}
            Create Account
          </button>
        </form>

        <p className="text-center text-[#8899aa] text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[#e94560] hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </motion.div>
  );
}
