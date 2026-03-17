"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";

type Gender = "men" | "women";
type SizeType = "tops" | "bottoms" | "shoes";

const SIZE_DATA: Record<Gender, Record<SizeType, { headers: string[]; rows: string[][] }>> = {
  men: {
    tops: {
      headers: ["Size", "Chest (in)", "Chest (cm)", "Length (in)", "Shoulder (in)"],
      rows: [
        ["XS", "34–36", "86–91", "26", "16"],
        ["S", "36–38", "91–97", "27", "17"],
        ["M", "38–40", "97–102", "28", "18"],
        ["L", "40–42", "102–107", "29", "19"],
        ["XL", "42–44", "107–112", "30", "20"],
        ["XXL", "44–46", "112–117", "31", "21"],
      ],
    },
    bottoms: {
      headers: ["Size", "Waist (in)", "Waist (cm)", "Hip (in)", "Inseam (in)"],
      rows: [
        ["28", "28", "71", "36", "30"],
        ["30", "30", "76", "38", "30"],
        ["32", "32", "81", "40", "31"],
        ["34", "34", "86", "42", "31"],
        ["36", "36", "91", "44", "32"],
        ["38", "38", "97", "46", "32"],
      ],
    },
    shoes: {
      headers: ["India", "UK", "US", "EU", "Foot Length (cm)"],
      rows: [
        ["6", "6", "7", "39", "24.5"],
        ["7", "7", "8", "40", "25.5"],
        ["8", "8", "9", "42", "26.5"],
        ["9", "9", "10", "43", "27.5"],
        ["10", "10", "11", "44", "28.5"],
        ["11", "11", "12", "45", "29.5"],
      ],
    },
  },
  women: {
    tops: {
      headers: ["Size", "Bust (in)", "Bust (cm)", "Length (in)", "Shoulder (in)"],
      rows: [
        ["XS", "30–32", "76–81", "23", "14"],
        ["S", "32–34", "81–86", "24", "14.5"],
        ["M", "34–36", "86–91", "25", "15"],
        ["L", "36–38", "91–97", "26", "15.5"],
        ["XL", "38–40", "97–102", "27", "16"],
        ["XXL", "40–42", "102–107", "28", "16.5"],
      ],
    },
    bottoms: {
      headers: ["Size", "Waist (in)", "Waist (cm)", "Hip (in)", "Inseam (in)"],
      rows: [
        ["26", "26", "66", "34", "29"],
        ["28", "28", "71", "36", "29"],
        ["30", "30", "76", "38", "30"],
        ["32", "32", "81", "40", "30"],
        ["34", "34", "86", "42", "30"],
        ["36", "36", "91", "44", "31"],
      ],
    },
    shoes: {
      headers: ["India", "UK", "US", "EU", "Foot Length (cm)"],
      rows: [
        ["3", "3", "5", "35", "22"],
        ["4", "4", "6", "36", "23"],
        ["5", "5", "7", "37", "24"],
        ["6", "6", "8", "39", "25"],
        ["7", "7", "9", "40", "26"],
        ["8", "8", "10", "41", "27"],
      ],
    },
  },
};

const TABS: { key: SizeType; label: string; emoji: string }[] = [
  { key: "tops", label: "Tops / Shirts", emoji: "👕" },
  { key: "bottoms", label: "Bottoms / Pants", emoji: "👖" },
  { key: "shoes", label: "Shoes / Footwear", emoji: "👟" },
];

export default function SizeGuidePage() {
  const [gender, setGender] = useState<Gender>("men");
  const [sizeType, setSizeType] = useState<SizeType>("tops");

  const data = SIZE_DATA[gender][sizeType];

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <header className="sticky top-0 z-30 bg-[#1a1a2e]/80 backdrop-blur-md border-b border-[#233554]">
        <div className="max-w-4xl mx-auto px-4 pt-5 pb-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Ruler className="w-6 h-6 text-[#e94560]" />
              Size Guide
            </h1>
            <p className="text-[#8899aa] text-sm mt-0.5">Indian & international sizing charts for all clothing</p>
          </div>

          {/* Gender toggle */}
          <div className="flex gap-2">
            {(["men", "women"] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  gender === g ? "bg-[#e94560] text-white" : "bg-[#16213e] text-[#8899aa] hover:bg-[#233554]"
                }`}
              >
                {g === "men" ? "👨 Men" : "👩 Women"}
              </button>
            ))}
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSizeType(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  sizeType === tab.key ? "bg-[#e94560] text-white" : "bg-[#16213e] text-[#8899aa] hover:bg-[#233554]"
                }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-[#16213e] rounded-2xl border border-[#233554] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#233554]">
                  {data.headers.map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[#8899aa] font-medium text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i} className="border-b border-[#233554]/50 hover:bg-[#1a1a2e]/50 transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className={`px-4 py-3 ${j === 0 ? "text-[#e94560] font-bold" : "text-white"}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-[#16213e] rounded-2xl border border-[#233554] p-5 space-y-3">
          <h3 className="text-white font-semibold">📏 How to Measure</h3>
          <ul className="space-y-2 text-[#8899aa] text-sm">
            <li>• <span className="text-white">Chest/Bust:</span> Measure around the fullest part of your chest, keeping the tape level.</li>
            <li>• <span className="text-white">Waist:</span> Measure around your natural waistline, at the narrowest point.</li>
            <li>• <span className="text-white">Hip:</span> Measure around the fullest part of your hips.</li>
            <li>• <span className="text-white">Foot Length:</span> Stand on paper, mark heel and longest toe, measure the distance.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
