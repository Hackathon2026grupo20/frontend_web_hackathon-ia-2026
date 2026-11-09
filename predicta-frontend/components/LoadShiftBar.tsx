"use client";

import type { DemoLoadShift } from "@/lib/demoIlustrativo";

const hh = (h: number) => `${String(h).padStart(2, "0")}h`;

export function LoadShiftBar({ shift }: { shift: DemoLoadShift }) {
  const { janela, horaHabitual, horaRecomendada, duracaoHoras, economiaPct, equipamento } = shift;

  const ocupa = (h: number, inicio: number) => {
    for (let k = 0; k < duracaoHoras; k++) if ((inicio + k) % 24 === h) return true;
    return false;
  };

  return (
    <div className="bg-panel border border-border rounded-card p-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
        <h3 className="font-display text-base">Deslocamento de carga flexível</h3>
        <span className="text-sm font-mono" style={{ color: "var(--accent-good)" }}>
          −{economiaPct}% no horário sugerido
        </span>
      </div>
      <p className="text-sm text-dim mb-3">
        {equipamento}: hoje liga às {hh(horaHabitual)}; o horário sugerido é {hh(horaRecomendada)}.
      </p>
      <div className="flex gap-px" aria-hidden>
        {Array.from({ length: 24 }, (_, h) => {
          const permitido = h >= janela[0] && h < janela[1];
          const noHabitual = ocupa(h, horaHabitual);
          const noRecomendado = ocupa(h, horaRecomendada);
          const cor = noRecomendado ? "var(--accent-good)" : noHabitual ? "var(--accent-demand)" : "var(--border)";
          return (
            <div
              key={h}
              className="flex-1 rounded-sm"
              style={{ height: 8, background: cor, opacity: noRecomendado || noHabitual ? 1 : permitido ? 0.9 : 0.25 }}
              title={hh(h)}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-dim font-mono mt-1">
        <span>00h</span>
        <span className="flex gap-3">
          <span style={{ color: "var(--accent-demand)" }}>■ hoje</span>
          <span style={{ color: "var(--accent-good)" }}>■ sugerido</span>
        </span>
        <span>23h</span>
      </div>
    </div>
  );
}
