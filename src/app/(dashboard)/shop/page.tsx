"use client";

import { useState, useMemo } from "react";
import { Star, MapPin, Store, Filter } from "lucide-react";

// ── Types ────────────────────────────────────────────────

interface Vendor {
  id: string;
  name: string;
  city: string;
  state: string;
  category: string;
  priceRange: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
}

// ── Mock vendors ─────────────────────────────────────────

const VENDORS: Vendor[] = [
  {
    id: "v1",
    name: "Mumbai Threads",
    city: "Mumbai",
    state: "Maharashtra",
    category: "Streetwear",
    priceRange: "₹800 – ₹3,500",
    rating: 4.6,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
    description: "Urban streetwear with a desi twist. Bold prints, oversized fits.",
  },
  {
    id: "v2",
    name: "Jaipur Silk House",
    city: "Jaipur",
    state: "Rajasthan",
    category: "Saree",
    priceRange: "₹2,500 – ₹25,000",
    rating: 4.8,
    reviews: 548,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
    description: "Handloom Banarasi & Rajasthani silk sarees with traditional motifs.",
  },
  {
    id: "v3",
    name: "Punjab da Swag",
    city: "Amritsar",
    state: "Punjab",
    category: "Kurta",
    priceRange: "₹1,200 – ₹5,000",
    rating: 4.4,
    reviews: 198,
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600",
    description: "Premium cotton & linen kurtas with Phulkari embroidery.",
  },
  {
    id: "v4",
    name: "Chennai Couture",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Traditional",
    priceRange: "₹3,000 – ₹18,000",
    rating: 4.7,
    reviews: 421,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600",
    description: "Kanchipuram silks & South Indian traditional wear for all occasions.",
  },
  {
    id: "v5",
    name: "Delhi Dapper",
    city: "New Delhi",
    state: "Delhi",
    category: "Sherwani",
    priceRange: "₹8,000 – ₹45,000",
    rating: 4.9,
    reviews: 276,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600",
    description: "Luxury sherwanis & Indo-western groom wear. Bespoke tailoring.",
  },
  {
    id: "v6",
    name: "Kolkata Weaves",
    city: "Kolkata",
    state: "West Bengal",
    category: "Saree",
    priceRange: "₹1,800 – ₹12,000",
    rating: 4.5,
    reviews: 389,
    image: "https://images.unsplash.com/photo-1617627143233-46f5f0028140?w=600",
    description: "Tant & Jamdani sarees handcrafted by master artisans of Bengal.",
  },
  {
    id: "v7",
    name: "Ahmedabad Atelier",
    city: "Ahmedabad",
    state: "Gujarat",
    category: "Western",
    priceRange: "₹1,500 – ₹6,000",
    rating: 4.3,
    reviews: 154,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600",
    description: "Contemporary western wear blending Indian textiles & global design.",
  },
  {
    id: "v8",
    name: "Royal Rajputana",
    city: "Udaipur",
    state: "Rajasthan",
    category: "Sherwani",
    priceRange: "₹12,000 – ₹60,000",
    rating: 4.8,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600",
    description: "Heritage-inspired sherwanis with zari, mirror & thread handwork.",
  },
  {
    id: "v9",
    name: "Pune Street Style",
    city: "Pune",
    state: "Maharashtra",
    category: "Streetwear",
    priceRange: "₹600 – ₹2,800",
    rating: 4.2,
    reviews: 231,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600",
    description: "Gen-Z streetwear: graphic tees, joggers & sneaker culture.",
  },
  {
    id: "v10",
    name: "Lucknowi Chikan",
    city: "Lucknow",
    state: "Delhi",
    category: "Kurta",
    priceRange: "₹1,000 – ₹8,000",
    rating: 4.6,
    reviews: 445,
    image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600",
    description: "Authentic Lucknowi Chikankari hand-embroidered kurtas & suits.",
  },
  {
    id: "v11",
    name: "Madurai Cottons",
    city: "Madurai",
    state: "Tamil Nadu",
    category: "Traditional",
    priceRange: "₹900 – ₹5,500",
    rating: 4.4,
    reviews: 302,
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600",
    description: "Sungudi, Chettinad & handloom cotton wear of Tamil tradition.",
  },
  {
    id: "v12",
    name: "Surat Fashion Hub",
    city: "Surat",
    state: "Gujarat",
    category: "Western",
    priceRange: "₹500 – ₹3,000",
    rating: 4.1,
    reviews: 520,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600",
    description: "Affordable western fashion direct from India's textile capital.",
  },
];

const ALL_STATES = [...new Set(VENDORS.map((v) => v.state))].sort();
const ALL_CATEGORIES = [...new Set(VENDORS.map((v) => v.category))].sort();

// ── Rating stars ─────────────────────────────────────────

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-[#233554]"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-[#8899aa]">{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────

export default function ShopPage() {
  const [stateFilter, setStateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    return VENDORS.filter((v) => {
      if (stateFilter !== "all" && v.state !== stateFilter) return false;
      if (categoryFilter !== "all" && v.category !== categoryFilter) return false;
      return true;
    });
  }, [stateFilter, categoryFilter]);

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#1a1a2e]/80 backdrop-blur-md border-b border-[#233554]">
        <div className="max-w-6xl mx-auto px-4 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Store className="w-6 h-6 text-[#e94560]" />
                Indian Fashion Marketplace
              </h1>
              <p className="text-[#8899aa] text-sm mt-0.5">
                Discover authentic fashion from across India
              </p>
            </div>
            <span className="text-[#8899aa] text-sm">
              {filtered.length} store{filtered.length !== 1 && "s"}
            </span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-[#8899aa]" />

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#16213e] border border-[#233554] text-white text-sm focus:border-[#e94560] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All States</option>
              {ALL_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#16213e] border border-[#233554] text-white text-sm focus:border-[#e94560] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(stateFilter !== "all" || categoryFilter !== "all") && (
              <button
                onClick={() => {
                  setStateFilter("all");
                  setCategoryFilter("all");
                }}
                className="text-xs text-[#e94560] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Store className="w-16 h-16 text-[#233554] mb-4" />
            <p className="text-white font-semibold text-lg">No stores found</p>
            <p className="text-[#8899aa] text-sm mt-2">
              Try changing your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-[#16213e] rounded-2xl overflow-hidden border border-[#233554] hover:border-[#e94560]/40 transition-all group"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-[#1a1a2e]">
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-[#16213e]/90 text-[#e94560] border border-[#e94560]/30 backdrop-blur-sm">
                    {vendor.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2.5">
                  <h3 className="text-white font-bold text-lg truncate">
                    {vendor.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[#8899aa] text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {vendor.city}, {vendor.state}
                    </span>
                  </div>

                  <p className="text-[#8899aa] text-xs line-clamp-2 leading-relaxed">
                    {vendor.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <RatingStars rating={vendor.rating} />
                    <span className="text-[#8899aa] text-xs">
                      ({vendor.reviews})
                    </span>
                  </div>

                  <p className="text-white text-sm font-semibold">
                    {vendor.priceRange}
                  </p>

                  <button className="w-full py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-medium hover:bg-[#d13a52] transition-colors mt-1">
                    Visit Store
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
