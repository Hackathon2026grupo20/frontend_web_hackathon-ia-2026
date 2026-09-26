import type {
  ApiErrorBody,
  CatalogProfilesResponse,
  SimulationOptionsResponse,
  SimulationRequest,
  SimulationResponse,
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

export function getSimulationOptions(region: string) {
  return request<SimulationOptionsResponse>(
    `/api/v1/simulations/options/?region=${encodeURIComponent(region)}`
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
