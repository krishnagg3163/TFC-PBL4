// ── Clothing ──────────────────────────────────────────────

export type ClothingCategory =
  | "tops"
  | "bottoms"
  | "shoes"
  | "accessories"
  | "blazer"
  | "outerwear"
  | "dresses"
  | "activewear"
  | "formal";

export type Season = "spring" | "summer" | "fall" | "winter" | "all";

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  secondaryColor?: string;
  imageUrl: string;
  brand?: string;
  price?: number;
  size?: string;
  material?: string;
  tags: string[];
  season: Season[];
  favorite: boolean;
  wearCount: number;
  lastWorn?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Wardrobe ─────────────────────────────────────────────

export interface WardrobeItem extends ClothingItem {
  userId: string;
  addedFrom: "upload" | "camera" | "url" | "swipe";
  notes?: string;
}

export interface WardrobeFilters {
  category?: ClothingCategory;
  season?: Season;
  color?: string;
  favorite?: boolean;
  search?: string;
}

// ── Outfits ──────────────────────────────────────────────

export interface OutfitSuggestion {
  id: string;
  name: string;
  items: ClothingItem[];
  occasion: string;
  season: Season;
  rating?: number;
  weather?: string;
  generatedBy: "ai" | "user" | "community";
  likes: number;
  saves: number;
  createdAt: string;
}

// ── User ─────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  stylePreferences: string[];
  favoriteColors: string[];
  sizes: Record<string, string>;
  wardrobeCount: number;
  outfitCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Swipe ────────────────────────────────────────────────

export type SwipeDirection = "left" | "right" | "up";

export interface SwipeAction {
  id: string;
  userId: string;
  itemId: string;
  direction: SwipeDirection;
  item?: ClothingItem;
  timestamp: string;
}

export interface SwipeSession {
  items: ClothingItem[];
  currentIndex: number;
  actions: SwipeAction[];
}
