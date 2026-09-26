import type { RegionPreset } from "@/lib/regions";
import type { DistributorInfo, TariffProfile } from "@/types/api";

export function DistributorCard({
  preset,
  distributor,
  profile,
}: {
  preset: RegionPreset;
  distributor: DistributorInfo | null;
  profile: TariffProfile | null;
}) {
  // Nome e CNPJ vêm do catálogo da API quando disponível; o preset é só fallback.
  const nome = distributor?.sigla ?? preset.distributorLabel;
  const cnpj = distributor?.cnpj ?? preset.cnpj;
  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 2</p>
      <h2 className="font-display text-lg mb-3">Distribuidora</h2>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-display text-2xl">{nome}</span>
      </div>
      {distributor?.razao_social && <p className="text-xs text-dim">{distributor.razao_social}</p>}
      <p className="text-xs text-dim mt-1 font-mono">{cnpj}</p>
      <p className="text-xs text-dim mt-3">
        Região: <span className="font-medium text-text">{preset.label}</span>
      </p>
      {profile && (
        <p className="text-xs text-dim mt-1">
          Perfil ANEEL: <span className="font-medium text-text">{profile.label}</span>
          {profile.subgroup && ` · ${profile.subgroup}`}
        </p>
      )}
    </div>
  );
}
