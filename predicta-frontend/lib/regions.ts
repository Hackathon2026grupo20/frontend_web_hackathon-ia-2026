import type { SimulationRequest } from "@/types/api";

// Presets de região + distribuidora/CNPJ pra simplificar o formulário: o usuário só escolhe a
// localidade, o resto do payload (cnpj, distributor, profile, monthly_kwh, customer_type,
// flexible_pct) fica com defaults fixos aqui, sem aparecer na UI.
// IDs de região confirmados contra GET /api/v1/simulations/options/ (regions: N, NE, SE/CO, S).
//
// SE/CO (Light) foi validado de ponta a ponta contra o backend local:
// - "distributor" precisa ser o distributor_id da tarifa (ex.: "LIGHT SESA"), não a sigla.
// - "profile" precisa ser o id completo pipe-delimited de GET /api/v1/catalog/profiles/
//   (ex.: "B1|Convencional|Residencial|Residencial|Tarifa de Aplicação"), não um slug inventado.
//
// NE, S e N ainda NÃO têm 24h operacionais publicadas em system_signal_v1 (mesmo no backend
// local) — simulation_available fica false pra essas regiões, então cnpj/distributor/profile
// abaixo são placeholders não confirmados. Ajustar quando o backend publicar dados pra elas.
export interface RegionPreset {
  id: string;
  label: string;
  request: SimulationRequest;
}

export const REGIONS_DEMO: RegionPreset[] = [
  {
    id: "SE/CO",
    label: "Sudeste/Centro-Oeste (Light — Rio de Janeiro)",
    request: {
      cnpj: "60444437000146",
      region: "SE/CO",
      distributor: "LIGHT SESA",
      profile: "B1|Convencional|Residencial|Residencial|Tarifa de Aplicação",
      monthly_kwh: 350,
      customer_type: "residential",
      mode: "replay",
      flexible_pct: 20,
    },
  },
  {
    id: "NE",
    label: "Nordeste (Enel CE — Fortaleza)",
    request: {
      cnpj: "07047251000170",
      region: "NE",
      distributor: "Enel CE",
      profile: "residencial_padrao",
      monthly_kwh: 350,
      customer_type: "residential",
      mode: "replay",
      flexible_pct: 20,
    },
  },
  {
    id: "S",
    label: "Sul (CELESC)",
    request: {
      cnpj: "83878892000155",
      region: "S",
      distributor: "CELESC",
      profile: "residencial_padrao",
      monthly_kwh: 350,
      customer_type: "residential",
      mode: "replay",
      flexible_pct: 20,
    },
  },
  {
    id: "N",
    label: "Norte",
    request: {
      cnpj: "04895728000180",
      region: "N",
      distributor: "Equatorial",
      profile: "residencial_padrao",
      monthly_kwh: 350,
      customer_type: "residential",
      mode: "replay",
      flexible_pct: 20,
    },
  },
];

export function findRegionPreset(id: string): RegionPreset {
  return REGIONS_DEMO.find((r) => r.id === id) ?? REGIONS_DEMO[0];
}
