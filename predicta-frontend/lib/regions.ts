import type { SimulationRequest } from "@/types/api";

// Presets de região + distribuidora/CNPJ pra simplificar o formulário: o usuário só escolhe a
// localidade, o resto do payload (cnpj, distributor, profile, monthly_kwh, customer_type,
// flexible_pct) fica com defaults fixos aqui, sem aparecer na UI.
// IDs de região confirmados contra GET /api/v1/simulations/options/ na API de produção
// (retorna regions: N, NE, SE/CO, S). CNPJs/profile são exemplos — catalog/profiles/ ainda
// devolve profiles:[] vazio pra essas combinações em produção (dados ainda não carregados
// no backend), então "profile" pode precisar ajuste quando isso for populado.
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
      distributor: "Light",
      profile: "residencial_padrao",
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
