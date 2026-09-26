// Tipos espelhando o contrato real da API Predicta (endpoints /api/v1/*).
// Fonte: web/studio/api.py + api_serializers.py e docs/PREDICTA_API.md no repo do backend.

export interface RegionOption {
  id: string;
  available: boolean;
}

export interface SimulationOptionsResponse {
  region: string;
  mode: string;
  effective_date: string | null;
  operational_status: { available: boolean; reason?: string; [key: string]: unknown };
  replay_windows: Record<string, unknown>[];
  simulation_available: boolean;
  display_timezone: string;
  // Enviado pelo backend, mas ausente do OpenAPI gerado.
  regions?: RegionOption[];
}

// Item de catalog/profiles — ver tariff_profiles_for_cnpj() em services/distribution.py.
export interface TariffProfile {
  id: string;
  label: string;
  distributor_id: string;
  cnpj: string;
  base_total_rs_kwh: number;
  base_te_rs_kwh: number;
  base_tusd_rs_kwh: number;
  posts: string[];
  valid_from: string;
  valid_to: string;
  effective_date: string;
  subgroup: string;
  modality: string;
  customer_class: string;
}

export interface DistributorInfo {
  cnpj_digits?: string;
  cnpj?: string;
  sigla?: string;
  razao_social?: string;
  uf?: string;
  subsystem_id?: string;
  subsystem_mapping_method?: string;
  [key: string]: unknown;
}

export interface CatalogProfilesResponse {
  distributor: DistributorInfo | null;
  profiles: TariffProfile[];
  display_timezone: string;
}

export type CustomerType = "residential" | "commercial" | "industrial_flat";
export type SimulationMode = "replay" | "operational";

export interface SimulationRequest {
  cnpj: string;
  region: string;
  distributor: string; // distributor_id da tabela ANEEL (vem de catalog/profiles)
  profile: string; // tariff_profile_id (vem de catalog/profiles)
  monthly_kwh: number;
  customer_type: CustomerType;
  mode: SimulationMode;
  replay_key?: string | null;
  flexible_pct: number;
}

export interface HourlyPoint {
  interval_start_utc: string;
  local_iso: string; // ex.: "2026-09-19T21:00:00-03:00"
  time: string; // ex.: "19/09 21h"
  base_rs_kwh: number;
  dynamic_rs_kwh: number;
  consumption_kwh: number;
  optimized_consumption_kwh: number;
  multiplier: number;
  demand_pressure: number; // percentil de demanda D, 0..1
  demand_p50_mw: number;
  demand_context: string;
  demand_reference_n: number | null;
  delta_pct: number;
}

export interface SimulationResponse {
  customer: Record<string, unknown>;
  concession: DistributorInfo | null;
  optimization: Record<string, unknown>;
  window: Record<string, unknown>;
  hourly: HourlyPoint[];
  simulation_mode: string;
  display_timezone: string;
  simulation_scope_pt: string;
  reference_tariff_mean_rs_kwh: number;
  dynamic_tariff_mean_rs_kwh: number;
  reference_cost_24h_rs: number;
  dynamic_cost_24h_rs: number;
  difference_pct: number;
}

export interface ApiErrorBody {
  detail: string;
}
