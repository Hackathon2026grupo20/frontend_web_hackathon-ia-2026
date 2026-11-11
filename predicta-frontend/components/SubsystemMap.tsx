"use client";

import { useState } from "react";
import { SUBSISTEMAS, type SubsistemaForecast } from "@/lib/demoForecast";

// Mapa estilizado e simplificado dos 4 subsistemas elétricos — formas abstratas, não um
// contorno geográfico fiel do Brasil. Pendência: substituir pelos paths definitivos quando
// houver um SVG de referência (ver nota em app/page.tsx / relatório final).
const REGIOES: { id: SubsistemaForecast["id"]; path: string; hitbox: { top: string; left: string; width: string; height: string } }[] = [
  {
    id: "N",
    path: "M70,20 C120,0 190,10 215,45 C230,70 210,105 170,110 C120,115 70,95 60,60 C55,40 55,28 70,20 Z",
    hitbox: { top: "0%", left: "15%", width: "55%", height: "32%" },
  },
  {
    id: "NE",
    path: "M215,45 C250,35 285,55 290,95 C293,130 265,160 225,155 C195,151 175,125 170,110 C210,105 230,70 215,45 Z",
    hitbox: { top: "12%", left: "50%", width: "42%", height: "32%" },
  },
  {
    id: "SE/CO",
    path: "M60,110 C90,100 150,108 170,110 C175,125 195,151 225,155 C235,190 215,235 170,250 C120,265 75,240 65,195 C58,165 55,135 60,110 Z",
    hitbox: { top: "30%", left: "16%", width: "55%", height: "48%" },
  },
  {
    id: "S",
    path: "M80,250 C110,245 150,248 170,250 C178,275 165,305 135,310 C105,315 80,295 78,275 C77,265 78,257 80,250 Z",
    hitbox: { top: "72%", left: "22%", width: "32%", height: "22%" },
  },
];

export function SubsystemMap() {
  const [activeId, setActiveId] = useState<SubsistemaForecast["id"] | null>(null);
  const ativo = SUBSISTEMAS.find((s) => s.id === activeId) ?? null;

  return (
    <div className="grid md:grid-cols-[minmax(0,260px)_1fr] gap-6 items-center">
      <div className="relative mx-auto w-full max-w-[260px] aspect-[3/3.4]">
        <svg viewBox="0 0 300 330" className="w-full h-full" aria-hidden="true">
          {REGIOES.map((r) => {
            const isActive = activeId === r.id;
            return (
              <path
                key={r.id}
                d={r.path}
                fill={isActive ? "var(--accent-demand)" : "var(--accent-good)"}
                fillOpacity={isActive ? 0.85 : 0.35}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>
        {REGIOES.map((r) => (
          <button
            key={r.id}
            type="button"
            className="absolute"
            style={{ top: r.hitbox.top, left: r.hitbox.left, width: r.hitbox.width, height: r.hitbox.height }}
            onMouseEnter={() => setActiveId(r.id)}
            onFocus={() => setActiveId(r.id)}
            onClick={() => setActiveId((cur) => (cur === r.id ? null : r.id))}
            aria-pressed={activeId === r.id}
            aria-label={`Subsistema ${r.id}`}
          />
        ))}
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
