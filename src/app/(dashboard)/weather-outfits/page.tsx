"use client";

import { useState } from "react";
import { CloudSun, Thermometer, Droplets, Wind } from "lucide-react";

const WEATHER_OUTFITS = [
  { temp: "Hot (35°C+)", icon: "☀️", gradient: "from-orange-500/20 to-yellow-500/10", tips: ["Light cotton kurta or linen shirt", "Breathable chinos or palazzo pants", "Open sandals or canvas sneakers", "Sunglasses & cotton dupatta"], cities: "Delhi, Jaipur, Nagpur" },
  { temp: "Warm (25–34°C)", icon: "🌤️", gradient: "from-amber-500/20 to-orange-400/10", tips: ["Half-sleeve cotton shirt", "Chinos or cotton jeans", "White sneakers or loafers", "Light watch & simple chain"], cities: "Mumbai, Bengaluru, Hyderabad" },
  { temp: "Mild (18–24°C)", icon: "⛅", gradient: "from-blue-400/20 to-teal-400/10", tips: ["Full-sleeve shirt or light sweater", "Dark jeans or tailored trousers", "Boots or leather sneakers", "Layer with a denim jacket"], cities: "Pune, Mysuru, Shimla (summer)" },
  { temp: "Cool (10–17°C)", icon: "🌥️", gradient: "from-slate-400/20 to-blue-500/10", tips: ["Wool sweater or hoodie", "Corduroy pants or warm jeans", "Chelsea boots", "Add a scarf or shawl"], cities: "Darjeeling, Ooty, Manali" },
  { temp: "Cold (0–9°C)", icon: "❄️", gradient: "from-cyan-400/20 to-blue-600/10", tips: ["Layered thermals + woolen kurta", "Heavy denim or wool trousers", "Insulated winter boots", "Puffer jacket + muffler + gloves"], cities: "Srinagar, Leh, Gulmarg" },
  { temp: "Rainy / Monsoon", icon: "🌧️", gradient: "from-indigo-500/20 to-purple-500/10", tips: ["Quick-dry fabric kurta or tee", "Shorts or roll-up pants", "Waterproof sandals or gum boots", "Carry a compact umbrella or rain jacket"], cities: "Cherrapunji, Mumbai, Kerala" },
];

export default function WeatherOutfitsPage() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <header className="sticky top-0 z-30 bg-[#1a1a2e]/80 backdrop-blur-md border-b border-[#233554]">
        <div className="max-w-5xl mx-auto px-4 pt-5 pb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-[#e94560]" />
            Weather-Based Outfits
          </h1>
          <p className="text-[#8899aa] text-sm mt-0.5">What to wear for every Indian weather condition</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Weather tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {WEATHER_OUTFITS.map((w, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selected === i ? "bg-[#e94560] text-white" : "bg-[#16213e] text-[#8899aa] hover:bg-[#233554]"
              }`}
            >
              <span>{w.icon}</span> {w.temp}
            </button>
          ))}
        </div>

        {/* Selected weather detail */}
        <div className={`bg-gradient-to-br ${WEATHER_OUTFITS[selected].gradient} bg-[#16213e] rounded-2xl border border-[#233554] p-6 space-y-5`}>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{WEATHER_OUTFITS[selected].icon}</span>
            <div>
              <h2 className="text-white text-2xl font-bold">{WEATHER_OUTFITS[selected].temp}</h2>
              <p className="text-[#8899aa] text-sm">{WEATHER_OUTFITS[selected].cities}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-white font-semibold">Recommended Outfit:</h3>
            {WEATHER_OUTFITS[selected].tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-[#1a1a2e]/50 rounded-xl px-4 py-3 border border-[#233554]/50">
                <span className="text-[#e94560] font-bold text-sm mt-0.5">{i + 1}</span>
                <p className="text-white text-sm">{tip}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-2 text-[#8899aa] text-xs">
            <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5" /> Temperature</span>
            <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> Humidity</span>
            <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> Wind Speed</span>
          </div>
        </div>
      </main>
    </div>
  );
}
