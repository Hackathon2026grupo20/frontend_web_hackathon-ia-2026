"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSimulationOptions } from "@/lib/api";
import { PLANOS, type Plano, type PlanoId } from "@/lib/plans";
import { findRegionPreset, type RegionPreset } from "@/lib/regions";
import { simularCliente, type SimulationResult } from "@/lib/simulation";
import { ajustarAoPlano, preferenciasPadrao, type PreferenciasNotificacao } from "@/lib/notificacoes";
import { cargaPadrao, type CargaConfig } from "@/lib/cargaFlexivel";
import { perfilDaCarga, type PerfilConsumo } from "@/lib/perfilConsumo";
import { USUARIO, type Usuario } from "@/lib/usuario";
import type { ReplayWindow } from "@/types/api";

// Distribuidora contratada pelo cliente. Não é escolha do painel: vem do perfil
// (lib/usuario.ts) e só pode ser trocada em /perfil, que é o cadastro dele.
export interface DistribuidoraContratada {
  cnpj: string;
  regionId: string;
}

interface ClienteState {
  usuario: Usuario;
  plano: Plano;
  setPlano: (id: PlanoId) => void;
  distribuidora: DistribuidoraContratada;
  setDistribuidora: (d: DistribuidoraContratada) => void;
  preset: RegionPreset; // região do contrato: dá o rótulo e o modo de simulação
  replayWindows: ReplayWindow[];
  replayKey: string; // "" = janela mais recente disponível
  setReplayKey: (key: string) => void;
  resultado: SimulationResult | null;
  carregando: boolean;
  erro: string | null;
  prefs: PreferenciasNotificacao;
  setPrefs: (p: PreferenciasNotificacao) => void;
  lidas: string[];
  marcarLidas: (ids: string[]) => void;
  carga: CargaConfig;
  setCarga: (c: CargaConfig) => void;
  perfil: PerfilConsumo; // consumo + % flexível efetivamente simulados
}

const ClienteContext = createContext<ClienteState | null>(null);

function lerStorage(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravarStorage(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // modo privado / storage bloqueado: segue só com o estado em memória
  }
}

export function ClienteProvider({ children }: { children: React.ReactNode }) {
  const [planoId, setPlanoId] = useState<PlanoId>(USUARIO.planoContratado);
  const [distribuidora, setDistribuidoraState] = useState<DistribuidoraContratada>({
    cnpj: USUARIO.distribuidoraCnpj,
    regionId: USUARIO.regionId,
  });
  const [replayWindows, setReplayWindows] = useState<ReplayWindow[]>([]);
  const [replayKey, setReplayKey] = useState(""); // "" = mais recente (o backend usa a última janela)
  const [resultado, setResultado] = useState<SimulationResult | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [prefs, setPrefsState] = useState<PreferenciasNotificacao>(preferenciasPadrao(USUARIO.planoContratado));
  const [lidas, setLidas] = useState<string[]>([]);
  const [carga, setCargaState] = useState<CargaConfig>(cargaPadrao());

  // O que o cliente editou fica no navegador (protótipo, sem conta real).
  // ?plano=pequeno|medio|grande na URL tem prioridade — útil para links de demonstração.
  useEffect(() => {
    const daUrl = new URLSearchParams(window.location.search).get("plano");
    const p = daUrl && daUrl in PLANOS ? daUrl : lerStorage("predicta-plano");
    if (p && p in PLANOS) setPlanoId(p as PlanoId);
    if (daUrl && daUrl in PLANOS) gravarStorage("predicta-plano", daUrl);

    try {
      const raw = lerStorage("predicta-distribuidora");
      if (raw) {
        const d = JSON.parse(raw) as DistribuidoraContratada;
        if (d?.cnpj && d?.regionId) setDistribuidoraState(d);
      }
    } catch {
      // guardado inválido: segue com a distribuidora do perfil
    }

    // Carga é do cliente, não do plano: uma chave só, que sobrevive à troca de assinatura.
    try {
      const raw = lerStorage("predicta-carga");
      if (raw) setCargaState(JSON.parse(raw) as CargaConfig);
    } catch {
      setCargaState(cargaPadrao());
    }

    try {
      setLidas(JSON.parse(lerStorage("predicta-notif-lidas") ?? "[]"));
    } catch {
      setLidas([]);
    }
  }, []);

  const plano = PLANOS[planoId];
  const preset = findRegionPreset(distribuidora.regionId);

  // Preferências de notificação são guardadas por plano e sempre ajustadas aos limites dele.
  useEffect(() => {
    let salvas: PreferenciasNotificacao | null = null;
    try {
      const raw = lerStorage(`predicta-notif-${planoId}`);
      salvas = raw ? (JSON.parse(raw) as PreferenciasNotificacao) : null;
    } catch {
      salvas = null;
    }
    setPrefsState(ajustarAoPlano(salvas ?? preferenciasPadrao(planoId), planoId));
  }, [planoId]);

  // Ao trocar a distribuidora do contrato, busca as janelas de replay da região e volta pra
  // "mais recente".
  useEffect(() => {
    let cancelado = false;
    setReplayWindows([]);
    setReplayKey("");
    getSimulationOptions(distribuidora.regionId, preset.mode)
      .then((opts) => {
        if (!cancelado) setReplayWindows(opts.replay_windows ?? []);
      })
      .catch(() => {
        // Falha aqui não é crítica — a simulação ainda roda com a janela mais recente.
      });
    return () => {
      cancelado = true;
    };
  }, [distribuidora.regionId, preset.mode]);

  const perfil: PerfilConsumo = perfilDaCarga(carga);
  const chavePerfil = `${perfil.monthly_kwh}|${perfil.customer_type}|${perfil.flexible_pct}`;

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    simularCliente(
      {
        cnpj: distribuidora.cnpj,
        regionId: distribuidora.regionId,
        mode: preset.mode,
        rotulo: preset.distributorLabel,
      },
      perfil,
      replayKey
    )
      .then((data) => {
        if (!cancelado) setResultado(data);
      })
      .catch((e) => {
        if (cancelado) return;
        setResultado(null);
        // TypeError = falha de rede ou bloqueio de CORS (o fetch não chega a ter status HTTP)
        setErro(
          e instanceof TypeError
            ? "Não foi possível conectar à API (rede ou CORS)"
            : e instanceof Error
              ? e.message
              : "Não foi possível carregar a simulação."
        );
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distribuidora.cnpj, distribuidora.regionId, chavePerfil, replayKey]);

  const value: ClienteState = {
    usuario: USUARIO,
    plano,
    setPlano: (id) => {
      setPlanoId(id);
      gravarStorage("predicta-plano", id);
    },
    distribuidora,
    setDistribuidora: (d) => {
      setDistribuidoraState(d);
      gravarStorage("predicta-distribuidora", JSON.stringify(d));
    },
    preset,
    replayWindows,
    replayKey,
    setReplayKey,
    resultado,
    carregando,
    erro,
    prefs,
    setPrefs: (p) => {
      const ajustadas = ajustarAoPlano(p, planoId);
      setPrefsState(ajustadas);
      gravarStorage(`predicta-notif-${planoId}`, JSON.stringify(ajustadas));
    },
    lidas,
    marcarLidas: (ids) => {
      const novas = Array.from(new Set([...lidas, ...ids])).slice(-200);
      setLidas(novas);
      gravarStorage("predicta-notif-lidas", JSON.stringify(novas));
    },
    carga,
    setCarga: (c) => {
      setCargaState(c);
      gravarStorage("predicta-carga", JSON.stringify(c));
    },
    perfil,
  };

  return <ClienteContext.Provider value={value}>{children}</ClienteContext.Provider>;
}

export function useCliente() {
  const ctx = useContext(ClienteContext);
  if (!ctx) throw new Error("useCliente precisa estar dentro de <ClienteProvider>");
  return ctx;
}
