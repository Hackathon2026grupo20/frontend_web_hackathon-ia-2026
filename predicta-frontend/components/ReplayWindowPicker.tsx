"use client";

import type { ReplayWindow } from "@/types/api";

export function ReplayWindowPicker({
  windows,
  replayKey,
  onChange,
}: {
  windows: ReplayWindow[];
  replayKey: string;
  onChange: (key: string) => void;
}) {
  if (windows.length === 0) return null;

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 3.5 · replay</p>
      <h2 className="font-display font-bold text-lg mb-3">Dia simulado</h2>
      <select
        value={replayKey}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-text font-body"
      >
        <option value="">Mais recente disponível</option>
        {windows.map((w) => (
          <option key={w.key} value={w.key}>
            {w.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-dim mt-2">
        Modo replay: reexibe um dia histórico como se fosse a previsão do dia seguinte — só pra teste/demo, já que o
        modo operacional (H01–H24 a partir de agora) ainda não está publicado nesta região.
      </p>
    </div>
  );
}
