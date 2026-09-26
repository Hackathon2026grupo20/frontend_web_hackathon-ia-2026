// Tipos espelhando o contrato real da API Predicta (endpoints /api/v1/*).
// Ver docs/PREDICTA_API.md no repo do backend para o schema completo.

export interface RegionOption {
  id: string;
  available: boolean;
}

export interface ReplayWindow {
  key: string; // = issue_time_utc; é o que volta no POST como "replay_key"
  label: string; // ex.: "15/12/2025 · 00h–23h"
  local_date: string; // "2025-12-15"
  local_start: string;
  local_end: string;
  timezone: string;
  source: string;
  issue_time_utc: string;
}

export interface SimulationOptionsResponse {
  region: string;
  mode: string;
  effective_date: string | null;
  operational_status: { available: boolean; reason?: string } | string;
  replay_windows: ReplayWindow[];
  simulation_available: boolean;
  display_timezone: string;
  regions: RegionOption[];
}

export interface DistributorInfo {
  cnpj_digits: string;
  cnpj: string;
  sigla: string;
  razao_social: string;
  uf: string;
  regiao: string;
  subsystem_id: string;
  codigo_area_atuacao: string;
  num_municipios: number;
  num_unidades_consumidoras: number;
  area_km2: number;
  subsystem_mapping_method: string;
  tariff_rows: number;
  tariff_agent_names: string;
  tariff_valid_from: string;
  tariff_valid_to: string;
  has_tariff_history: boolean;
}

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
  [key: string]: unknown;
}

export interface CatalogProfilesResponse {
  distributor: DistributorInfo;
  profiles: TariffProfile[];
  display_timezone: string;
}

export interface SimulationRequest {
  cnpj: string;
  region: string;
  distributor: string;
  profile: string;
  monthly_kwh: number;
  customer_type: string;
  mode: string;
  flexible_pct: number;
  replay_key?: string; // key de um ReplayWindow — se omitido, o backend usa a última janela disponível
}

export interface HourlyPoint {
  interval_start_utc: string;
  local_iso: string;
  time: string; // ex.: "31/12 00h" — rótulo já formatado pelo backend, não normalizado
  base_rs_kwh: number;
  dynamic_rs_kwh: number;
  consumption_kwh: number;
  optimized_consumption_kwh: number;
  multiplier: number;
  demand_pressure: number; // fração 0..1 (percentil de pressão de demanda na hora), não categoria
  demand_p50_mw: number;
  demand_context: string;
  demand_reference_n: number | null;
  delta_pct: number;
}

export interface SimulationCustomer {
  distributor_id: string;
  distributor_cnpj: string;
  concession_sigla: string;
  concession_name: string;
  tariff_profile_id: string;
  subsystem_id: string;
  customer_type: string;
  profile_source: string;
  daily_consumption_kwh: number;
  [key: string]: unknown;
}

export interface SimulationOptimization {
  flexible_fraction: number;
  flexible_energy_kwh: number;
  actually_shifted_kwh: number;
  flexible_percent: number;
  original_dynamic_cost_24h_rs: number;
  optimized_dynamic_cost_24h_rs: number;
  potential_savings_24h_rs: number;
  potential_savings_pct: number;
  potential_savings_month_rs: number;
  method: string;
  is_illustrative: boolean;
  [key: string]: unknown;
}

export interface SimulationResponse {
  customer: SimulationCustomer;
  concession: DistributorInfo;
  optimization: SimulationOptimization;
  window: ReplayWindow;
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

// Pipeline de retreino / engenharia de features — GET /api/v1/pipeline/stages/,
// POST /api/v1/pipeline/stages/<id>/run/, GET /api/v1/pipeline/runs/<id>/.

export type PipelineParamKind = "select" | "number" | "date" | "text" | "checkbox";

export interface PipelineParam {
  name: string;
  label: string;
  kind: PipelineParamKind;
  default: string;
  help?: string;
  choices: [string, string][];
  required: boolean;
}

export interface PipelineStageRequirement {
  key: string;
  label: string;
  exists: boolean;
}

export interface PipelineStage {
  id: string;
  section: string;
  title: string;
  summary: string;
  explanation: string;
  why: string;
  status: string;
  required: PipelineStageRequirement[];
  outputs: unknown[];
  params: PipelineParam[];
}

export type PipelineRunStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";

export interface PipelineRun {
  id: string;
  status: PipelineRunStatus;
  log_tail: string;
  error_message?: string | null;
  [key: string]: unknown;
}

export type UploadDataset = "load" | "supply" | "tariffs" | "climate_e3";

export interface DatasetUploadResponse {
  rows: number;
  columns: string[];
  path: string;
}
