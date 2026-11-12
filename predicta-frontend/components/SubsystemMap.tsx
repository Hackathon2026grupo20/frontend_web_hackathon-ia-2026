"use client";

import { useState } from "react";
import { SUBSISTEMAS, type SubsistemaForecast } from "@/lib/demoForecast";
import { BRASIL_VIEWBOX, REGIOES_MAPA } from "@/lib/brasilMapa";

// Mapa do Brasil com os estados agrupados nos 4 subsistemas elétricos do SIN (agrupamento do ONS).
// A geometria vem de lib/brasilMapa.ts.
export function SubsystemMap() {
  const [activeId, setActiveId] = useState<SubsistemaForecast["id"] | null>(null);
  const ativo = SUBSISTEMAS.find((s) => s.id === activeId) ?? null;

  return (
    <div className="grid md:grid-cols-[minmax(0,340px)_1fr] gap-6 items-center">
      <div className="mx-auto w-full max-w-[340px]">
        <svg
          viewBox={BRASIL_VIEWBOX}
          className="w-full h-auto"
          role="group"
          aria-label="Mapa do Brasil dividido nos subsistemas elétricos SE/CO, S, NE e N"
        >
          {REGIOES_MAPA.map((r) => {
            const isActive = activeId === r.id;
            return (
              <g
                key={r.id}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`Subsistema ${r.id}`}
                className="cursor-pointer outline-none"
                onMouseEnter={() => setActiveId(r.id)}
                onFocus={() => setActiveId(r.id)}
                onClick={() => setActiveId((cur) => (cur === r.id ? null : r.id))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveId((cur) => (cur === r.id ? null : r.id));
                  }
                }}
              >
                {r.estados.map((e) => (
                  <path
                    key={e.uf}
                    d={e.d}
                    fill={isActive ? "var(--accent-demand)" : "var(--accent-good)"}
                    fillOpacity={isActive ? 0.85 : 0.35}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={0.6}
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                ))}
                <text
                  x={r.label.x}
                  y={r.label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono pointer-events-none select-none"
                  style={{ fontSize: 13, fontWeight: 700, fill: "rgba(255,255,255,0.92)" }}
                >
                  {r.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="border border-white/10 rounded-card p-5 bg-white/5 min-h-[120px]">
        {ativo ? (
          <>
            <p className="text-xs font-mono text-white/55 mb-1">{ativo.id}</p>
            <h3 className="font-display font-bold text-white mb-1.5">{ativo.label}</h3>
            <p className="text-base text-white/85 leading-relaxed">{ativo.descricao}</p>
          </>
        ) : (
          <p className="text-base text-white/65">Passe o mouse ou toque em uma região do mapa pra ver o subsistema.</p>
        )}
      </div>
    </div>
  );
}
