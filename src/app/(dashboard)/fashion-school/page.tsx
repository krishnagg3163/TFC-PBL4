"use client";

import { BookOpen, Play, Star, Clock } from "lucide-react";

const LESSONS = [
  { id: 1, title: "Color Theory for Outfits", category: "Basics", duration: "8 min", rating: 4.8, emoji: "🎨", description: "Learn which colors complement each other and how to build a cohesive color palette for your wardrobe." },
  { id: 2, title: "Body Types & Silhouettes", category: "Basics", duration: "12 min", rating: 4.9, emoji: "📐", description: "Understand your body type and discover which silhouettes flatter you the most." },
  { id: 3, title: "Capsule Wardrobe 101", category: "Strategy", duration: "10 min", rating: 4.7, emoji: "🧳", description: "Build a 30-piece capsule wardrobe that creates 100+ outfit combinations." },
  { id: 4, title: "Indian Formal Wear Guide", category: "Traditional", duration: "15 min", rating: 4.8, emoji: "👔", description: "Master the art of Indian formal dressing — from sherwanis to bandhgalas." },
  { id: 5, title: "Streetwear Fundamentals", category: "Trends", duration: "7 min", rating: 4.5, emoji: "🔥", description: "Learn the core principles of streetwear styling and brand mixing." },
  { id: 6, title: "Saree Draping Styles", category: "Traditional", duration: "20 min", rating: 4.9, emoji: "🥻", description: "10 different saree draping techniques from regions across India." },
  { id: 7, title: "Accessorizing Like a Pro", category: "Advanced", duration: "9 min", rating: 4.6, emoji: "💎", description: "Watches, rings, chains — learn how to layer accessories without overdoing it." },
  { id: 8, title: "Seasonal Transitions", category: "Strategy", duration: "11 min", rating: 4.4, emoji: "🍂", description: "How to transition your wardrobe between seasons without buying an entirely new one." },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-[#233554]"}`} />
      ))}
      <span className="ml-1 text-xs text-[#8899aa]">{rating}</span>
    </div>
  );
}

export default function FashionSchoolPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <header className="sticky top-0 z-30 bg-[#1a1a2e]/80 backdrop-blur-md border-b border-[#233554]">
        <div className="max-w-5xl mx-auto px-4 pt-5 pb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#e94560]" />
            Fashion School
          </h1>
          <p className="text-[#8899aa] text-sm mt-0.5">Learn fashion fundamentals and level up your style</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {LESSONS.map((lesson) => (
            <div key={lesson.id} className="bg-[#16213e] rounded-2xl border border-[#233554] hover:border-[#e94560]/40 transition-all overflow-hidden group">
              <div className="h-32 bg-gradient-to-br from-[#e94560]/20 to-[#16213e] flex items-center justify-center">
                <span className="text-5xl">{lesson.emoji}</span>
              </div>
              <div className="p-4 space-y-2.5">
                <span className="text-[10px] uppercase tracking-wide font-medium text-[#e94560] bg-[#e94560]/10 px-2 py-0.5 rounded-full">{lesson.category}</span>
                <h3 className="text-white font-bold">{lesson.title}</h3>
                <p className="text-[#8899aa] text-xs line-clamp-2">{lesson.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-[#8899aa] text-xs">
                    <Clock className="w-3 h-3" /> {lesson.duration}
                  </div>
                  <RatingStars rating={lesson.rating} />
                </div>
                <button className="w-full py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-medium hover:bg-[#d13a52] transition-colors flex items-center justify-center gap-2 mt-1">
                  <Play className="w-4 h-4" /> Start Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
