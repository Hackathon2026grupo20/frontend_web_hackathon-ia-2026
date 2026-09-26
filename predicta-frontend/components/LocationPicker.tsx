"use client";

import { REGIONS_DEMO } from "@/lib/regions";

export function LocationPicker({
  regionId,
  onChange,
}: {
  regionId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Localidade</p>
      <h2 className="font-display font-bold text-lg mb-3">Região</h2>
      <select
        value={regionId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-text font-body"
      >
        {REGIONS_DEMO.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-dim mt-2">
        Distribuidora, tarifa e previsão de demanda vêm da localidade escolhida.
      </p>
    </div>
  );
}
