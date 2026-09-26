import { getCatalogProfiles, runSimulation } from "@/lib/api";
import { mockSimulation, type PerfilConsumo } from "@/lib/mock";
import type { RegionPreset } from "@/lib/regions";
import type { CustomerType, DistributorInfo, SimulationResponse, TariffProfile } from "@/types/api";

// NEXT_PUBLIC_USE_MOCK=1 → dashboard roda sem backend, com dados sintéticos sinalizados na UI.
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "1";

export interface SimulationResult {
  simulation: SimulationResponse;
  profile: TariffProfile | null;
  distributor: DistributorInfo | null;
  mock: boolean;
}

// Subgrupo ANEEL de baixa tensão por tipo de cliente: B1 residencial; B3 "demais classes"
// (comércio, serviços e indústria em baixa tensão). Os perfis volumétricos do MVP são todos B.
const SUBGRUPO: Record<CustomerType, string> = { residential: "B1", commercial: "B3", industrial_flat: "B3" };

// Variantes que não representam o cliente padrão: pré-pagamento, compensação de micro/minigeração
// (SCEE), tarifa social e tarifas entre distribuidoras (A2/A4 "Distribuição", ~R$ 0,01/kWh).
const VARIANTE = /pré-pagamento|SCEE|baixa renda|distribuição|cooperativa|irriga/i;

// O backend só aceita distributor_id/tariff_profile_id que existam na tabela ANEEL para o CNPJ,
// então o perfil vem de catalog/profiles: o convencional do subgrupo do cliente, sem variantes.
function escolherPerfilTarifa(profiles: TariffProfile[], tipo: CustomerType): TariffProfile | undefined {
  const padrao = profiles.filter((p) => !VARIANTE.test(p.label) && p.subgroup.startsWith("B"));
  return (
    padrao.find((p) => p.subgroup === SUBGRUPO[tipo] && /convencional/i.test(p.modality)) ??
    padrao.find((p) => p.subgroup === SUBGRUPO[tipo]) ??
    padrao[0]
  );
}

export async function simularRegiao(preset: RegionPreset, perfil: PerfilConsumo): Promise<SimulationResult> {
  if (USE_MOCK) {
    return { simulation: mockSimulation(preset, perfil), profile: null, distributor: null, mock: true };
  }

  const catalogo = await getCatalogProfiles(preset.cnpj, preset.id);
  const perfilTarifa = escolherPerfilTarifa(catalogo.profiles, perfil.customer_type);
  if (!perfilTarifa) {
    throw new Error(
      `A API não tem perfil tarifário ANEEL vigente para ${preset.distributorLabel} (CNPJ ${preset.cnpj}). ` +
        "As tarifas processadas provavelmente ainda não foram carregadas no backend."
    );
  }

  const simulation = await runSimulation({
    cnpj: preset.cnpj,
    region: preset.id,
    distributor: perfilTarifa.distributor_id,
    profile: perfilTarifa.id,
    monthly_kwh: perfil.monthly_kwh,
    customer_type: perfil.customer_type,
    mode: preset.mode,
    flexible_pct: perfil.flexible_pct,
  });
  return { simulation, profile: perfilTarifa, distributor: catalogo.distributor, mock: false };
}
