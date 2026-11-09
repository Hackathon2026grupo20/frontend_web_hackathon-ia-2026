"use client";

import { useState } from "react";
import { DEMO_UNIDADES } from "@/lib/demoIlustrativo";
import { ForecastChart } from "@/components/ForecastChart";
import { LoadShiftBar } from "@/components/LoadShiftBar";

export default function DemoNaPratica() {
  const [unidadeId, setUnidadeId] = useState(DEMO_UNIDADES[0].id);
  const unidade = DEMO_UNIDADES.find((u) => u.id === unidadeId) ?? DEMO_UNIDADES[0];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4" role="tablist" aria-label="Unidade de exemplo">
        {DEMO_UNIDADES.map((u) => (
          <button
            key={u.id}
            type="button"
            role="tab"
            aria-selected={u.id === unidadeId}
            onClick={() => setUnidadeId(u.id)}
            className={`px-4 py-2 rounded-card text-sm font-medium border transition-colors ${
              u.id === unidadeId ? "text-white border-transparent" : "border-border text-dim hover:text-text"
            }`}
            style={u.id === unidadeId ? { background: "var(--accent-brand)" } : undefined}
          >
            {u.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ForecastChart data={unidade.hourly} />
        <LoadShiftBar shift={unidade.loadShift} />
      </div>

      <p className="text-xs text-dim mt-4">
        Simulação ilustrativa com dados de exemplo. A curva de consumo é sintética.
      </p>
    </div>
  );
}
