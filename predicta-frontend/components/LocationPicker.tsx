"use client";

import { FILIAIS_DEMO } from "@/lib/mockData";

export function LocationPicker({
  filialId,
  onChange,
}: {
  filialId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Filial</p>
      <h2 className="font-display font-bold text-lg mb-3">Unidade cadastrada</h2>
      <select
        value={filialId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-text font-body"
      >
        {FILIAIS_DEMO.map((f) => (
          <option key={f.id} value={f.id}>
            {f.nome}
          </option>
        ))}
      </select>
      <p className="text-xs text-dim mt-2">
        Local, distribuidora e subsistema vêm do cadastro do cliente — troque aqui só se a empresa tiver mais de uma
        filial.
      </p>
    </div>
  );
}
