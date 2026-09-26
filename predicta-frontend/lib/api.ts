import type {
  ApiErrorBody,
  CatalogProfilesResponse,
  DatasetUploadResponse,
  PipelineRun,
  PipelineStage,
  SimulationOptionsResponse,
  SimulationRequest,
  SimulationResponse,
  UploadDataset,
} from "@/types/api";

// Sem autenticação hoje: a API é pública, tudo por região (+ CNPJ da distribuidora).
// Ver contexto completo em docs internos — endpoints sob /api/v1/, sem auth.
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as ApiErrorBody;
      detail = body.detail ?? detail;
    } catch {
      // corpo não era JSON — mantém o statusText
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

// Sem Content-Type fixo — o navegador define o boundary do multipart sozinho.
async function requestRaw<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as ApiErrorBody;
      detail = body.detail ?? detail;
    } catch {
      // corpo não era JSON — mantém o statusText
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

export function getSimulationOptions(region: string, mode: string = "replay") {
  return request<SimulationOptionsResponse>(
    `/api/v1/simulations/options/?region=${encodeURIComponent(region)}&mode=${encodeURIComponent(mode)}`
  );
}

export function getCatalogProfiles(cnpj: string, region: string) {
  return request<CatalogProfilesResponse>(
    `/api/v1/catalog/profiles/?cnpj=${encodeURIComponent(cnpj)}&region=${encodeURIComponent(region)}`
  );
}

export function runSimulation(payload: SimulationRequest) {
  return request<SimulationResponse>(`/api/v1/simulations/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPipelineStages() {
  return request<PipelineStage[]>(`/api/v1/pipeline/stages/`);
}

export function runPipelineStage(stageId: string, params: Record<string, string>) {
  return request<{ id: string; status: string }>(`/api/v1/pipeline/stages/${encodeURIComponent(stageId)}/run/`, {
    method: "POST",
    body: JSON.stringify({ params }),
  });
}

export function getPipelineRun(runId: string) {
  return request<PipelineRun>(`/api/v1/pipeline/runs/${encodeURIComponent(runId)}/`);
}

// Sobrescreve o dataset direto no backend, sem merge nem validação de schema — usar com cuidado.
export function uploadDataset(dataset: UploadDataset, file: File) {
  const form = new FormData();
  form.append("file", file);
  return requestRaw<DatasetUploadResponse>(`/api/v1/data/uploads/${dataset}/`, {
    method: "POST",
    body: form,
  });
}
