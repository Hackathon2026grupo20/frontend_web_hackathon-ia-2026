// Tipos espelhando o contrato de API rascunhado no documento de arquitetura.
// Ajustar quando o backend confirmar o payload real de system_signal_v1.

export type Subsistema = "SECO" | "S" | "NE" | "N";

export interface Distribuidora {
  cnpj: string;
  sigla: string;
  razaoSocial: string;
}

export interface LocationResolveResponse {
  subsistema: Subsistema;
  distribuidora: Distribuidora;
  confiancaGeolocalizacao: "ponto_exato" | "conjunto_nomeado" | "agregado_estadual";
}

export interface TarifaBaseResponse {
  teRsMwh: number;
  tusdRsMwh: number;
  totalRsKwh: number;
  vigenciaInicio: string;
  vigenciaFim: string | null;
}

export interface PrevisaoHora {
  hora: string; // "00:00".."23:00"
  p10: number;
  p50: number;
  p90: number;
}

export interface SystemSignal {
  issueTime: string;
  subsistema: Subsistema;
  previsao: PrevisaoHora[];
  // D = pressão de demanda, S = pressão de oferta (pode ser null), C = exposição climática
  d: number;
  s: number | null;
  c: number;
  qualityFlags: string[];
}

export interface SimulacaoHora {
  hora: string;
  tarifaBaseRsKwh: number;
  tarifaDinamicaRsKwh: number;
  multiplicador: number;
}

export interface SimulacaoResponse {
  horas: SimulacaoHora[];
  custoTotalBase: number;
  custoTotalDinamico: number;
  melhoresHoras: string[];
  pioresHoras: string[];
  avisos: string[];
}
