"use client";

import type { HourlyPoint } from "@/types/api";
import { encontrarJanela, corPorMultiplicador } from "@/lib/loadShift";
import { horaLocal } from "@/lib/format";

export function LoadShiftBar({ hourly }: { hourly: HourlyPoint[] }) {
  const multiplicadores = hourly.map((h) => h.multiplier);
  const min = Math.min(...multiplicadores);
  const max = Math.max(...multiplicadores);

  const janelaBoa = encontrarJanela(hourly, 3, "melhor");
  const janelaRuim = encontrarJanela(hourly, 3, "pior");

  // A janela simulada pode não começar à meia-noite: marcas a cada 6h a partir do primeiro ponto.
  const marcas = [0, 6, 12, 18, hourly.length - 1].filter((i) => i < hourly.length).map((i) => horaLocal(hourly[i]));

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 7</p>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-display font-bold text-lg">Quando transferir a carga flexível</h2>
        <span className="text-xs text-dim">arraste o olhar pelas cores →</span>
      </div>

      {/* Faixa de 24 horas, cor contínua de verde (bom) a vermelho (ruim) */}
      <div className="flex gap-[2px] h-10 rounded-card overflow-hidden">
        {hourly.map((h) => (
          <div
            key={h.interval_start_utc}
            className="flex-1"
            style={{
              backgroundColor: corPorMultiplicador(h.multiplier, min, max, "#39e67a", "#ff4d3d", "#2a3350"),
            }}
            title={`${h.time} — multiplicador ${h.multiplier.toFixed(2)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-dim mt-1 font-mono">
        {marcas.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>

      {/* Leitura direta: de onde pra onde transferir */}
      <div className="flex items-center gap-3 mt-5 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-card glow-box-alert bg-alert/10">
          <span className="w-2.5 h-2.5 rounded-full bg-alert flex-shrink-0" />
          <span className="text-sm">
            Pico caro: <b className="text-text">{janelaRuim.inicio}–{janelaRuim.fim}</b>
          </span>
        </div>
        <span className="text-dim">→ transferir para →</span>
        <div className="flex items-center gap-2 px-3 py-2 rounded-card glow-box-good bg-good/10">
          <span className="w-2.5 h-2.5 rounded-full bg-good flex-shrink-0" />
          <span className="text-sm">
            Vale barato: <b className="text-text">{janelaBoa.inicio}–{janelaBoa.fim}</b>
          </span>
        </div>
      </div>
    </div>
  );
}
