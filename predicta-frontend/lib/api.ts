import type {
  ApiErrorBody,
  CatalogProfilesResponse,
  DistributionAreasResponse,
  SimulationOptionsResponse,
  SimulationRequest,
  SimulationResponse,
} from "@/types/api";

// Sem autenticação hoje: a API é pública, tudo por região (+ CNPJ da distribuidora).
// Ver contexto completo em docs internos — endpoints sob /api/v1/, sem auth.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// TTL curto pra evitar martelar o backend (Render free tier dorme e demora ~50-60s pra acordar)
// com requests repetidas/idênticas disparadas por re-render, StrictMode ou navegação entre as
// páginas do painel (dashboard/economia/carga/recomendações podem pedir a mesma simulação).
// Não é cache de dado "pra sempre" — só absorve rajadas de chamadas iguais numa janela curta.
const CACHE_TTL_MS = 20_000;
const cache = new Map<string, { expiresAt: number; promise: Promise<unknown> }>();

function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.promise as Promise<T>;

  const promise = fetcher().catch((e) => {
    cache.delete(key); // erro não deve "grudar" no cache até o TTL expirar
    throw e;
  });
  cache.set(key, { expiresAt: now + CACHE_TTL_MS, promise });
  return promise;
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

export function getSimulationOptions(region: string, mode: string = "replay") {
  const path = `/api/v1/simulations/options/?region=${encodeURIComponent(region)}&mode=${encodeURIComponent(mode)}`;
  return withCache(`GET ${path}`, () => request<SimulationOptionsResponse>(path));
}

// Catálogo de distribuidoras. Vem com a geometria das áreas de concessão (~570 KB, servidos
// com compressão), então é buscado uma vez por sessão e fica no cache por chave fixa.
export function getDistributionAreas() {
  const path = `/api/v1/catalog/distribution-areas/`;
  return withCache(`GET ${path}`, () => request<DistributionAreasResponse>(path));
}

export function getCatalogProfiles(cnpj: string, region: string) {
  const path = `/api/v1/catalog/profiles/?cnpj=${encodeURIComponent(cnpj)}&region=${encodeURIComponent(region)}`;
  return withCache(`GET ${path}`, () => request<CatalogProfilesResponse>(path));
}

export function runSimulation(payload: SimulationRequest) {
  // Determinístico pro mesmo payload (mesma região/perfil/consumo/flexible_pct/replay_key) —
  // cachear é seguro; qualquer edição do cliente (carga, plano) muda o payload e gera nova chave.
  return withCache(`POST /simulations ${JSON.stringify(payload)}`, () =>
    request<SimulationResponse>(`/api/v1/simulations/`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  );
}
