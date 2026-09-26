import type { RegionPreset } from "@/lib/regions";

export function DistributorCard({ preset }: { preset: RegionPreset }) {
  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 2</p>
      <h2 className="font-display text-lg mb-3">Distribuidora</h2>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-display text-2xl">{preset.request.distributor}</span>
      </div>
      <p className="text-xs text-dim mt-1 font-mono">{preset.request.cnpj}</p>
      <p className="text-xs text-dim mt-3">
        Região: <span className="font-medium text-text">{preset.label}</span>
      </p>
    </div>
  );
}
