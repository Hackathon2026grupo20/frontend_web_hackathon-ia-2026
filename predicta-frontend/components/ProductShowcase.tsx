"use client";

import { useState } from "react";
import { SUBSISTEMAS } from "@/lib/demoForecast";
import { ForecastBandChart } from "@/components/ForecastBandChart";
import { BrowserFrame } from "@/components/BrowserFrame";

export default function ProductShowcase() {
  const [subId, setSubId] = useState<(typeof SUBSISTEMAS)[number]["id"]>(SUBSISTEMAS[0].id);
  const sub = SUBSISTEMAS.find((s) => s.id === subId) ?? SUBSISTEMAS[0];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap" role="tablist" aria-label="Subsistema elétrico">
        {SUBSISTEMAS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === subId}
            onClick={() => setSubId(s.id)}
            className={`px-3.5 py-1.5 rounded-card text-sm font-medium border transition-colors ${
              s.id === subId
                ? "text-white border-transparent"
                : "border-white/15 text-white/60 hover:text-white hover:border-white/30"
            }`}
            style={s.id === subId ? { background: "var(--accent-brand)" } : undefined}
          >
            {s.id}
          </button>
        ))}
      </div>

      <BrowserFrame>
        <p className="text-sm text-white/70 mb-2">
          Pressão de demanda prevista — {sub.label}, próximas 24h <span className="text-white/40">(dados sintéticos)</span>
        </p>
        <ForecastBandChart data={sub.hourly} />
      </BrowserFrame>

      <p className="text-xs text-white/40 mt-4 text-center">Visualização ilustrativa · dados sintéticos</p>
    </div>
  );
}
