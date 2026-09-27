import type { SimulationMode } from "@/types/api";

// Presets de região + CNPJ da concessão pra simplificar o formulário: o usuário só escolhe a
// localidade. O perfil de consumo (kWh/mês, tipo, % flexível) vem do plano (lib/plans.ts).
// distributor_id e tariff_profile_id NÃO ficam fixos aqui — o backend valida os
// dois contra a tabela ANEEL, então eles são buscados em GET /api/v1/catalog/profiles/
// (ver lib/simulation.ts). IDs de região confirmados contra GET /api/v1/simulations/options/.
//
// SE/CO (Enel RJ) é a única região validada ponta a ponta contra o backend. NE, S e N ainda NÃO
// têm 24h operacionais publicadas em system_signal_v1 (mesmo no backend local) — simulation_available
// fica false pra essas regiões, então os CNPJs abaixo são placeholders não confirmados e
// catalog/profiles/ pode devolver profiles:[] vazio. Ajustar quando o backend publicar dados.
//
// `label` é só o nome do subsistema — em /verificacao a distribuidora é escolhida à parte
// (lib/distribuidoras.ts, as 103 do catálogo ANEEL), então fixar um nome de distribuidora aqui
// ficaria errado assim que o usuário trocasse a seleção. `distributorLabel` continua existindo
// só como rótulo provisório em telas que ainda não têm a distribuidora resolvida pela API.
export interface RegionPreset {
  id: string;
  label: string;
  cnpj: string;
  distributorLabel: string;
  mode: SimulationMode;
}

const DEFAULTS = { mode: "replay" } as const;

export const REGIONS_DEMO: RegionPreset[] = [
  {
    id: "SE/CO",
    label: "Sudeste/Centro-Oeste",
    cnpj: "33050071000158",
    distributorLabel: "Enel RJ",
    ...DEFAULTS,
  },
  {
    id: "NE",
    label: "Nordeste",
    cnpj: "07047251000170",
    distributorLabel: "Enel CE",
    ...DEFAULTS,
  },
  {
    id: "S",
    label: "Sul",
    cnpj: "08336783000190",
    distributorLabel: "CELESC",
    ...DEFAULTS,
  },
  {
    id: "N",
    label: "Norte",
    cnpj: "04895728000180",
    distributorLabel: "Equatorial",
    ...DEFAULTS,
  },
];

export function findRegionPreset(id: string): RegionPreset {
  return REGIONS_DEMO.find((r) => r.id === id) ?? REGIONS_DEMO[0];
}
