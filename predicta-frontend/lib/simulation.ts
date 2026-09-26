import { getCatalogProfiles, runSimulation } from "@/lib/api";
import { mockSimulation } from "@/lib/mock";
import type { RegionPreset } from "@/lib/regions";
import type { DistributorInfo, SimulationResponse, TariffProfile } from "@/types/api";

// NEXT_PUBLIC_USE_MOCK=1 → dashboard roda sem backend, com dados sintéticos sinalizados na UI.
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "1";

export interface SimulationResult {
  simulation: SimulationResponse;
  profile: TariffProfile | null;
  distributor: DistributorInfo | null;
  mock: boolean;
}

// O backend só aceita distributor_id/tariff_profile_id que existam na tabela ANEEL para o CNPJ,
// então o perfil vem de catalog/profiles. Preferimos o residencial (B1) quando existir.
function escolherPerfil(profiles: TariffProfile[]): TariffProfile | undefined {
  const residencial = profiles.find((p) => /resid/i.test(p.customer_class) || /resid/i.test(p.label));
  return residencial ?? profiles[0];
}

export async function simularRegiao(preset: RegionPreset): Promise<SimulationResult> {
  if (USE_MOCK) {
    return { simulation: mockSimulation(preset), profile: null, distributor: null, mock: true };
  }

  const catalogo = await getCatalogProfiles(preset.cnpj, preset.id);
  const perfil = escolherPerfil(catalogo.profiles);
  if (!perfil) {
    throw new Error(
      `A API não tem perfil tarifário ANEEL vigente para ${preset.distributorLabel} (CNPJ ${preset.cnpj}). ` +
        "As tarifas processadas provavelmente ainda não foram carregadas no backend."
    );
  }

  const simulation = await runSimulation({
    cnpj: preset.cnpj,
    region: preset.id,
    distributor: perfil.distributor_id,
    profile: perfil.id,
    monthly_kwh: preset.monthly_kwh,
    customer_type: preset.customer_type,
    mode: preset.mode,
    flexible_pct: preset.flexible_pct,
  });
  return { simulation, profile: perfil, distributor: catalogo.distributor, mock: false };
}
