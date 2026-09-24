import type {
  Distribuidora,
  LocationResolveResponse,
  SimulacaoResponse,
  SystemSignal,
  Subsistema,
} from "@/types/api";

export interface FilialPreset {
  id: string;
  nome: string;
  lat: number;
  lon: number;
}

// Filiais cadastradas pelo cliente — não é "escolher um ponto no mapa" no dia a dia,
// é selecionar entre as unidades já cadastradas. Inclui uma filial fora do RJ/SE-CO
// de propósito: se o Predicta atender o Brasil inteiro (ainda não confirmado com a
// especialista), uma empresa com filiais em subsistemas diferentes precisa poder trocar
// entre elas e ver a distribuidora/subsistema mudarem junto.
export const FILIAIS_DEMO: FilialPreset[] = [
  { id: "rj-centro", nome: "Rio de Janeiro — Centro (Light)", lat: -22.906, lon: -43.172 },
  { id: "rj-lagos", nome: "Região dos Lagos — RJ (Enel RJ)", lat: -22.878, lon: -42.019 },
  { id: "rj-baixada", nome: "Baixada Fluminense — RJ (Light)", lat: -22.755, lon: -43.411 },
  { id: "ce-fortaleza", nome: "Fortaleza — CE (Enel CE)", lat: -3.732, lon: -38.527 },
];

const RESOLVE_POR_FILIAL: Record<string, LocationResolveResponse> = {
  "rj-centro": {
    subsistema: "SECO",
    distribuidora: { cnpj: "60.444.437/0001-46", sigla: "LIGHT", razaoSocial: "Light Serviços de Eletricidade S.A." },
    confiancaGeolocalizacao: "ponto_exato",
  },
  "rj-baixada": {
    subsistema: "SECO",
    distribuidora: { cnpj: "60.444.437/0001-46", sigla: "LIGHT", razaoSocial: "Light Serviços de Eletricidade S.A." },
    confiancaGeolocalizacao: "ponto_exato",
  },
  "rj-lagos": {
    subsistema: "SECO",
    distribuidora: { cnpj: "33.050.071/0001-58", sigla: "ENEL RJ", razaoSocial: "Enel Distribuição Rio S.A." },
    confiancaGeolocalizacao: "conjunto_nomeado",
  },
  "ce-fortaleza": {
    subsistema: "NE",
    distribuidora: { cnpj: "07.047.251/0001-70", sigla: "ENEL CE", razaoSocial: "Enel Distribuição Ceará S.A." },
    confiancaGeolocalizacao: "ponto_exato",
  },
};

export function mockResolveLocation(filialId: string): LocationResolveResponse {
  return RESOLVE_POR_FILIAL[filialId] ?? RESOLVE_POR_FILIAL["rj-centro"];
}

// Tarifa de exemplo próxima à citada no documento (CEMIG-D, R$0,85858/kWh) — só pra ilustrar escala
export function mockTarifaBase() {
  return {
    teRsMwh: 412.3,
    tusdRsMwh: 446.28,
    totalRsKwh: 0.85858,
    vigenciaInicio: "2026-04-01",
    vigenciaFim: "2027-03-31",
  };
}

function curvaDemandaBase(hora: number, subsistema: Subsistema): number {
  // pico duplo: manhã (~10h) e noite (~19-21h) — formato típico de carga.
  // NE recebe uma leve variação de fase/amplitude só pra não ser um clone visual do SE/CO no demo.
  const fatorNE = subsistema === "NE" ? 0.85 : 1;
  const manha = 18 * fatorNE * Math.exp(-((hora - 10) ** 2) / 8);
  const noite = 26 * fatorNE * Math.exp(-((hora - 20) ** 2) / 6);
  return 42 + manha + noite;
}

export function mockSystemSignal(subsistema: Subsistema = "SECO"): SystemSignal {
  const previsao = Array.from({ length: 24 }, (_, h) => {
    const p50 = curvaDemandaBase(h, subsistema);
    return {
      hora: `${String(h).padStart(2, "0")}:00`,
      p10: Number((p50 * 0.93).toFixed(1)),
      p50: Number(p50.toFixed(1)),
      p90: Number((p50 * 1.09).toFixed(1)),
    };
  });
  return {
    issueTime: "2026-09-22T18:00:00-03:00",
    subsistema,
    previsao,
    d: 0.62,
    s: null, // exemplo proposital: sem fonte prospectiva confiável nesta simulação
    c: 0.41,
    qualityFlags: subsistema === "NE" ? ["cobertura_climatica_parcial_ne"] : [],
  };
}

export function mockSimulacao(subsistema: Subsistema = "SECO"): SimulacaoResponse {
  const base = mockTarifaBase().totalRsKwh;
  const horas = Array.from({ length: 24 }, (_, h) => {
    const pressao = curvaDemandaBase(h, subsistema);
    const norm = (pressao - 42) / 26;
    const multiplicador = Number((1 + (norm - 0.35) * 0.22).toFixed(3)); // guardrail simulado: -7% a +10%
    return {
      hora: `${String(h).padStart(2, "0")}:00`,
      tarifaBaseRsKwh: base,
      tarifaDinamicaRsKwh: Number((base * multiplicador).toFixed(5)),
      multiplicador,
    };
  });
  const custoTotalBase = horas.reduce((s, h) => s + h.tarifaBaseRsKwh, 0);
  const custoTotalDinamico = horas.reduce((s, h) => s + h.tarifaDinamicaRsKwh, 0);
  const ordenado = [...horas].sort((a, b) => a.multiplicador - b.multiplicador);
  return {
    horas,
    custoTotalBase: Number(custoTotalBase.toFixed(2)),
    custoTotalDinamico: Number(custoTotalDinamico.toFixed(2)),
    melhoresHoras: ordenado.slice(0, 3).map((h) => h.hora),
    pioresHoras: ordenado.slice(-3).map((h) => h.hora),
    avisos: ["Curva de consumo sintética — ilustrativa até integração com medição real do cliente."],
  };
}
