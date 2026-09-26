// Tipos espelhando o contrato real da API Predicta (endpoints /api/v1/*).
// Ver docs/PREDICTA_API.md no repo do backend para o schema completo.

export interface RegionOption {
  id: string;
  available: boolean;
}

export interface SimulationOptionsResponse {
  region: string;
  mode: string;
  effective_date: string;
  operational_status: string;
  replay_windows: unknown;
  simulation_available: boolean;
  display_timezone: string;
  regions: RegionOption[];
}

export interface TariffProfile {
  id: string;
  label?: string;
  [key: string]: unknown;
}

export interface CatalogProfilesResponse {
  distributor: string;
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

export interface SimulationResponse {
  customer: Record<string, unknown>;
  concession: Record<string, unknown>;
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
