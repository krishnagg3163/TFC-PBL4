"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  Check,
  Loader2,
  ShirtIcon,
  Sparkles,
  X,
  Plus,
  Trash2,
  Share2,
  Star,
} from "lucide-react";

const WARDROBE_API = "http://localhost:5000/api/wardrobe";
const LS_KEY = "tfc-saved-looks";

interface WardrobeItem {
  _id: string;
  name: string;
  category: string;
  color: string;
  imageBase64?: string;
  imageUrl?: string;
}

interface SavedLook {
  id: string;
  name: string;
  score: number;
  faceImage: string;
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  savedAt: string;
}

function getImg(item?: WardrobeItem | null): string {
  if (!item) return "";
  return item.imageBase64 || item.imageUrl || "";
}

function randomScore() {
  return Math.floor(Math.random() * 3) + 7;
}

function lsLoad(): SavedLook[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}

function lsSave(looks: SavedLook[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(looks)); } catch { /* quota */ }
}

function ItemCard({ item, selected, onClick }: { item: WardrobeItem; selected: boolean; onClick: () => void }) {
  const src = getImg(item);
  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 w-[90px] h-[90px] ${selected ? "border-[#e94560] shadow-md shadow-[#e94560]/30" : "border-[#233554] hover:border-[#e94560]/40"}`}
    >
      {src ? (
        <Image src={src} alt={item.name} fill className="object-cover" sizes="90px" unoptimized />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e]">
          <ShirtIcon className="w-5 h-5 text-[#233554]" />
        </div>
      )}
      {selected && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#e94560] flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/60 backdrop-blur-sm">
        <p className="text-white text-[8px] truncate">{item.name}</p>
      </div>
    </button>
  );
}

function OutfitSlot({ item, label, onClear }: { item?: WardrobeItem | null; label: string; onClear: () => void }) {
  const src = item ? getImg(item) : "";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#233554] bg-[#1a1a2e]">
        {src ? (
          <Image src={src} alt={label} fill className="object-cover" sizes="56px" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShirtIcon className="w-5 h-5 text-[#233554]" />
          </div>
        )}
        {item && (
          <button onClick={onClear} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#e94560] flex items-center justify-center">
            <X className="w-2.5 h-2.5 text-white" />
          </button>
        )}
      </div>
      <span className="text-[#8899aa] text-[9px]">{label}</span>
    </div>
  );
}

type TabKey = "tops" | "bottoms" | "shoes";

export default function FaceOutfitPage() {
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("tops");

  const [selTop, setSelTop] = useState<WardrobeItem | null>(null);
  const [selBottom, setSelBottom] = useState<WardrobeItem | null>(null);
  const [selShoes, setSelShoes] = useState<WardrobeItem | null>(null);

  const [score] = useState(() => randomScore());
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);

  useEffect(() => {
    fetch(WARDROBE_API)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setSavedLooks(lsLoad()); }, []);

  const tops = items.filter((i) => i.category?.toLowerCase().includes("top"));
  const bottoms = items.filter((i) => i.category?.toLowerCase().includes("bottom"));
  const shoes = items.filter((i) => i.category?.toLowerCase().includes("shoe"));

  const tabItems: Record<TabKey, WardrobeItem[]> = { tops, bottoms, shoes };
  const tabLabels: Record<TabKey, string> = {
    tops: `Tops (${tops.length})`,
    bottoms: `Bottoms (${bottoms.length})`,
    shoes: `Shoes (${shoes.length})`,
  };

  const onDrop = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setFaceImage(reader.result as string); setShowWebcam(false); };
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const capturePhoto = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (shot) { setFaceImage(shot); setShowWebcam(false); }
  }, []);

  const handleSaveLook = () => {
    if (!faceImage || saving) return;
    setSaving(true);
    const look: SavedLook = {
      id: `look-${Date.now()}`,
      name: [selTop?.name, selBottom?.name, selShoes?.name].filter(Boolean).join(" + ") || "My Look",
      score,
      faceImage,
      top: selTop ?? undefined,
      bottom: selBottom ?? undefined,
      shoes: selShoes ?? undefined,
      savedAt: new Date().toLocaleString(),
    };
    const updated = [look, ...savedLooks];
    setSavedLooks(updated);
    lsSave(updated);
    setSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
  };

  const deleteLook = (id: string) => {
    const updated = savedLooks.filter((l) => l.id !== id);
    setSavedLooks(updated);
    lsSave(updated);
  };

  const hasAnyItem = selTop || selBottom || selShoes;
  const showPreview = faceImage && hasAnyItem;

  return (
    <div className="min-h-screen bg-[#1a1a2e] pb-20">
      <header className="sticky top-0 z-30 bg-[#1a1a2e]/90 backdrop-blur-md border-b border-[#233554]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-white">
            Virtual <span className="text-[#e94560]">Try On</span>
          </h1>
          <p className="text-[#8899aa] text-xs mt-0.5">Upload your photo, pick your outfit, see the look</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* SPLIT SCREEN */}
        <div className="flex gap-6 items-start">
          {/* LEFT: Photo (40%) */}
          <div className="w-[40%] flex-shrink-0 space-y-4">
            <h2 className="text-white font-semibold text-base">Your Photo</h2>

            {!faceImage && !showWebcam && (
              <div className="space-y-3">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${isDragActive ? "border-[#e94560] bg-[#e94560]/10" : "border-[#233554] hover:border-[#e94560]/50 bg-[#16213e]"}`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-10 h-10 text-[#8899aa] mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">Drop your photo here</p>
                  <p className="text-[#8899aa] text-xs mt-1">or click to browse</p>
                </div>
                <button
                  onClick={() => setShowWebcam(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#16213e] border border-[#233554] text-[#8899aa] hover:text-white hover:border-[#e94560]/50 transition-colors text-sm"
                >
                  <Camera className="w-4 h-4" />
                  Take a selfie
                </button>
              </div>
            )}

            {showWebcam && !faceImage && (
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-[#233554] bg-black">
                  <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "user" }} className="w-full aspect-[4/3] object-cover" mirrored />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowWebcam(false)} className="flex-1 py-2.5 rounded-xl bg-[#233554] text-white text-sm font-medium">Cancel</button>
                  <button onClick={capturePhoto} className="flex-1 py-2.5 rounded-xl bg-[#e94560] text-white text-sm font-medium">Capture</button>
                </div>
              </div>
            )}

            {faceImage && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#e94560]/30 bg-[#16213e]">
                  <div className="relative w-full aspect-[3/4]">
                    <Image src={faceImage} alt="Your photo" fill className="object-cover" unoptimized />
                  </div>
                  <button
                    onClick={() => setFaceImage(null)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#e94560] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-center text-white text-sm font-semibold">Your Look</p>
              </div>
            )}
          </div>

          {/* RIGHT: Outfit Picker (60%) */}
          <div className="flex-1 space-y-4">
            <h2 className="text-white font-semibold text-base">Pick Your Outfit</h2>

            <div className="flex gap-1 p-1 rounded-xl bg-[#16213e] border border-[#233554] w-fit">
              {(["tops", "bottoms", "shoes"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-[#e94560] text-white" : "text-[#8899aa] hover:text-white"}`}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>

            <div className="bg-[#16213e] rounded-2xl border border-[#233554] p-4 min-h-[200px]">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-[#e94560] animate-spin" />
                </div>
              ) : tabItems[activeTab].length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ShirtIcon className="w-8 h-8 text-[#233554] mb-2" />
                  <p className="text-[#8899aa] text-sm">No {activeTab} in your wardrobe yet</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {tabItems[activeTab].map((item) => {
                    const isSelected =
                      (activeTab === "tops" && selTop?._id === item._id) ||
                      (activeTab === "bottoms" && selBottom?._id === item._id) ||
                      (activeTab === "shoes" && selShoes?._id === item._id);
                    return (
                      <ItemCard
                        key={item._id}
                        item={item}
                        selected={isSelected}
                        onClick={() => {
                          if (activeTab === "tops") setSelTop(isSelected ? null : item);
                          else if (activeTab === "bottoms") setSelBottom(isSelected ? null : item);
                          else setSelShoes(isSelected ? null : item);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <AnimatePresence>
              {hasAnyItem && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-[#16213e] rounded-2xl border border-[#233554] p-4"
                >
                  <p className="text-[#8899aa] text-xs mb-3">Current Outfit</p>
                  <div className="flex items-center gap-4">
                    <OutfitSlot item={selTop} label="Top" onClear={() => setSelTop(null)} />
                    <OutfitSlot item={selBottom} label="Bottom" onClear={() => setSelBottom(null)} />
                    <OutfitSlot item={selShoes} label="Shoes" onClear={() => setSelShoes(null)} />
                    {!faceImage && (
                      <p className="ml-auto text-[#8899aa] text-xs max-w-[100px] text-right leading-relaxed">Upload your photo to preview</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FULL-WIDTH: Complete Look Preview */}
        <AnimatePresence>
          {showPreview && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="bg-[#16213e] rounded-2xl border border-[#233554] p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Your Complete Look</h2>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a2e] border border-[#e94560]/30">
                  <Star className="w-4 h-4 text-[#e94560] fill-[#e94560]" />
                  <span className="text-white font-bold text-sm">{score}/10</span>
                  <span className="text-[#8899aa] text-xs">AI Style Score</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative w-48 rounded-2xl overflow-hidden border-2 border-[#e94560]/30 flex-shrink-0">
                  <div className="relative aspect-[3/4]">
                    <Image src={faceImage!} alt="You" fill className="object-cover" unoptimized />
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-[#233554] flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-[#8899aa]" />
                </div>

                <div className="flex flex-col gap-3 flex-1">
                  {[{ item: selTop, label: "Top" }, { item: selBottom, label: "Bottom" }, { item: selShoes, label: "Shoes" }].map(({ item, label }) =>
                    item ? (
                      <div key={label} className="flex items-center gap-3 bg-[#1a1a2e] rounded-xl p-2 border border-[#233554]">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={getImg(item)} alt={item.name} fill className="object-cover" sizes="48px" unoptimized />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{item.name}</p>
                          <p className="text-[#8899aa] text-xs">{label}</p>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveLook}
                  disabled={saving || savedOk}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#e94560] text-white font-semibold hover:bg-[#d13a52] transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : savedOk ? (
                    <><Check className="w-4 h-4" /> Saved!</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Save This Look</>
                  )}
                </button>
                <button
                  className="px-5 py-3 rounded-xl bg-[#233554] text-white font-medium hover:bg-[#2c3f5c] transition-colors flex items-center gap-2 text-sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: "My TFC Look", text: "Check out my outfit from TFC: Tinder for Clothes!" }).catch(() => {});
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* SAVED LOOKS */}
        <AnimatePresence>
          {savedLooks.length > 0 && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-white font-bold text-lg">Saved Looks</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {savedLooks.map((look) => (
                  <motion.div
                    key={look.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="bg-[#16213e] rounded-2xl border border-[#233554] overflow-hidden group"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image src={look.faceImage} alt={look.name} fill className="object-cover" unoptimized />
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                        <Star className="w-3 h-3 text-[#e94560] fill-[#e94560]" />
                        <span className="text-white text-xs font-bold">{look.score}</span>
                      </div>
                      <button
                        onClick={() => deleteLook(look.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-[#8899aa] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-[#e94560]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-white text-xs font-semibold truncate">{look.name}</p>
                      <p className="text-[#8899aa] text-[10px] mt-0.5">{look.savedAt}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
