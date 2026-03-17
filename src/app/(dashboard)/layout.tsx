"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/wardrobe", label: "My Wardrobe" },
  { href: "/discover", label: "Discover" },
  { href: "/face-outfit", label: "Try On" },
  { href: "/shop", label: "Shop" },
  { href: "/fashion-school", label: "Fashion School" },
  { href: "/weather-outfits", label: "Weather" },
  { href: "/size-guide", label: "Size Guide" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#1a1a2e]">
      {/* ── Sidebar ── */}
      <aside className="sticky top-0 h-screen w-[240px] flex flex-col border-r border-[#233554] bg-[#0f0f23]">
        {/* Logo */}
        <div className="px-4 h-16 border-b border-[#233554] flex items-center">
          <Link href="/" className="text-base font-semibold tracking-tight">
            <span className="text-[#e94560]">TFC</span>
            <span className="text-white">: Tinder for Clothes</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2.5 text-sm border-l-2 transition-colors ${
                  isActive
                    ? "border-l-[#e94560] text-white font-bold"
                    : "border-l-transparent text-[#8899aa] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[#233554] p-3">
          <div className="px-3 py-2.5 rounded-xl bg-[#16213e]">
            <p className="text-white text-sm font-medium truncate">Demo User</p>
            <p className="text-[#8899aa] text-xs truncate">demo@tfc.com</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}
