import type { DistributorInfo, TariffProfile } from "@/types/api";

// Distribuidora e regime tarifário do contrato. Tudo aqui vem da API
// (GET /catalog/profiles/ pelo CNPJ do cliente) — nada é escolhido no painel.
export function DistributorCard({
  distributor,
  profile,
  cnpj,
  regiaoLabel,
}: {
  distributor: DistributorInfo | null;
  profile: TariffProfile | null;
  cnpj: string;
  regiaoLabel: string;
}) {
  return (
    <div className="bg-panel border border-border rounded-card p-4">
      <p className="text-xs text-dim font-mono mb-1">Distribuidora</p>
      <h2 className="font-display text-xl leading-tight">{distributor?.sigla ?? "—"}</h2>
      {distributor?.razao_social && <p className="text-xs text-dim mt-0.5">{distributor.razao_social}</p>}
      <p className="text-xs text-dim mt-1 font-mono">{distributor?.cnpj ?? cnpj}</p>
      <p className="text-xs text-dim mt-2">
        Subsistema: <span className="font-medium text-text">{regiaoLabel}</span>
        {distributor?.uf && <span className="text-dim"> · {distributor.uf}</span>}
      </p>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-dim font-mono mb-1">Regime tarifário</p>
        {profile ? (
          <>
            <p className="text-sm font-medium leading-snug">{profile.label}</p>
            <p className="text-xs text-dim mt-1">
              {profile.subgroup} · {profile.modality}
            </p>
            <p className="text-xs text-dim mt-1">
              Tarifa-base <span className="font-mono text-text">R$ {profile.base_total_rs_kwh.toFixed(5)}</span>/kWh
            </p>
          </>
        ) : (
          <p className="text-xs text-dim">Sem perfil tarifário vigente para este CNPJ.</p>
        )}
      </div>
    </div>
  );
}
