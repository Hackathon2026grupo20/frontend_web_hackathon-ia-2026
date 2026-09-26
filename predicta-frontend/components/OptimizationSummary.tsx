import type { SimulationOptimization } from "@/types/api";

// "Sem mudar hábitos" = original_dynamic_cost_24h_rs (≈ referência, por design de neutralidade).
// "Com consumo otimizado" = optimized_dynamic_cost_24h_rs — é esse par que o site Django destaca
// como economia real; o difference_pct do topo NÃO é essa economia, é a neutralidade tarifária.
export function OptimizationSummary({ optimization }: { optimization: SimulationOptimization }) {
  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 8</p>
      <h2 className="font-display font-bold text-lg mb-3">Economia com deslocamento de carga</h2>

      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <div className="border border-border rounded-card px-3 py-2">
          <p className="text-[11px] text-dim">Sem mudar hábitos</p>
          <b className="text-sm font-mono">R$ {optimization.original_dynamic_cost_24h_rs.toFixed(2)}</b>
        </div>
        <div className="border border-border rounded-card px-3 py-2">
          <p className="text-[11px] text-dim">Com consumo otimizado</p>
          <b className="text-sm font-mono">R$ {optimization.optimized_dynamic_cost_24h_rs.toFixed(2)}</b>
        </div>
        <div className="border border-good rounded-card px-3 py-2 bg-good/10">
          <p className="text-[11px] text-dim">Economia potencial (24h)</p>
          <b className="text-sm font-mono text-good">
            R$ {optimization.potential_savings_24h_rs.toFixed(2)} · {optimization.potential_savings_pct.toFixed(2)}%
          </b>
        </div>
      </div>

      <p className="text-xs text-dim">
        Deslocando {optimization.flexible_percent.toFixed(0)}% da carga flexível ({optimization.flexible_energy_kwh.toFixed(2)}{" "}
        kWh) para as horas mais baratas — economia projetada de R$ {optimization.potential_savings_month_rs.toFixed(2)} no
        mês.
        {optimization.is_illustrative && " Valores ilustrativos."}
      </p>
    </div>
  );
}
