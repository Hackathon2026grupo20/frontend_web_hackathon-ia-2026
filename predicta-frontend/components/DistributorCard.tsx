import type { LocationResolveResponse } from "@/types/api";

const CONFIANCA_LABEL: Record<LocationResolveResponse["confiancaGeolocalizacao"], string> = {
  ponto_exato: "Localização exata",
  conjunto_nomeado: "Localização aproximada (conjunto)",
  agregado_estadual: "Localização aproximada (nível estado)",
};

export function DistributorCard({ data }: { data: LocationResolveResponse }) {
  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 2</p>
      <h2 className="font-display text-lg mb-3">Distribuidora</h2>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-display text-2xl">{data.distribuidora.sigla}</span>
        <span
          className="text-xs px-2 py-1 rounded-card border border-border text-dim"
          title="Nível de confiança da geolocalização — nunca apresentado como precisão que não existe"
        >
          {CONFIANCA_LABEL[data.confiancaGeolocalizacao]}
        </span>
      </div>
      <p className="text-sm text-dim">{data.distribuidora.razaoSocial}</p>
      <p className="text-xs text-dim mt-1 font-mono">{data.distribuidora.cnpj}</p>
      <p className="text-xs text-dim mt-3">
        Subsistema:{" "}
        <span className="font-medium text-text">{data.subsistema === "SECO" ? "Sudeste/Centro-Oeste" : data.subsistema}</span>
      </p>
    </div>
  );
}
