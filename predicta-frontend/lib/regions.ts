import type { SimulationMode } from "@/types/api";

// Presets de região + CNPJ da concessão pra simplificar o formulário: o usuário só escolhe a
// localidade. O perfil de consumo (kWh/mês, tipo, % flexível) vem do plano (lib/plans.ts).
// distributor_id e tariff_profile_id NÃO ficam fixos aqui — o backend valida os
// dois contra a tabela ANEEL, então eles são buscados em GET /api/v1/catalog/profiles/
// (ver lib/simulation.ts). IDs de região confirmados contra GET /api/v1/simulations/options/.
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
    label: "Sudeste/Centro-Oeste (Light — Rio de Janeiro)",
    cnpj: "60444437000146",
    distributorLabel: "Light",
    ...DEFAULTS,
  },
  {
    id: "NE",
    label: "Nordeste (Enel CE — Fortaleza)",
    cnpj: "07047251000170",
    distributorLabel: "Enel CE",
    ...DEFAULTS,
  },
  {
    id: "S",
    label: "Sul (CELESC)",
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
