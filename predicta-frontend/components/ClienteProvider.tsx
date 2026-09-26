"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { PLANOS, type Plano, type PlanoId } from "@/lib/plans";
import { REGIONS_DEMO, findRegionPreset, type RegionPreset } from "@/lib/regions";
import { simularRegiao, type SimulationResult } from "@/lib/simulation";
import { ajustarAoPlano, preferenciasPadrao, type PreferenciasNotificacao } from "@/lib/notificacoes";
import { cargaPadrao, pctFlexivel, type CargaConfig } from "@/lib/cargaFlexivel";
import type { PerfilConsumo } from "@/lib/mock";

interface ClienteState {
  plano: Plano;
  setPlano: (id: PlanoId) => void;
  preset: RegionPreset;
  setRegionId: (id: string) => void;
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
  const [planoId, setPlanoId] = useState<PlanoId>("medio");
  const [regionId, setRegionIdState] = useState(REGIONS_DEMO[0].id);
  const [resultado, setResultado] = useState<SimulationResult | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [prefs, setPrefsState] = useState<PreferenciasNotificacao>(preferenciasPadrao("medio"));
  const [lidas, setLidas] = useState<string[]>([]);
  const [carga, setCargaState] = useState<CargaConfig>(cargaPadrao("medio"));

  // Plano e região escolhidos ficam no navegador (protótipo, sem conta real).
  // ?plano=pequeno|medio|grande na URL tem prioridade — útil para links de demonstração.
  useEffect(() => {
    const daUrl = new URLSearchParams(window.location.search).get("plano");
    const p = daUrl && daUrl in PLANOS ? daUrl : lerStorage("predicta-plano");
    if (p && p in PLANOS) setPlanoId(p as PlanoId);
    if (daUrl && daUrl in PLANOS) gravarStorage("predicta-plano", daUrl);
    const r = lerStorage("predicta-regiao");
    if (r) setRegionIdState(findRegionPreset(r).id);
  }, []);

  const plano = PLANOS[planoId];
  const preset = findRegionPreset(regionId);

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
    // Carga flexível do cliente, também guardada por plano
    try {
      const raw = lerStorage(`predicta-carga-${planoId}`);
      setCargaState(raw ? (JSON.parse(raw) as CargaConfig) : cargaPadrao(planoId));
    } catch {
      setCargaState(cargaPadrao(planoId));
    }
    try {
      setLidas(JSON.parse(lerStorage("predicta-notif-lidas") ?? "[]"));
    } catch {
      setLidas([]);
    }
  }, [planoId]);

  const perfil: PerfilConsumo = {
    monthly_kwh: carga.monthly_kwh,
    customer_type: carga.customer_type,
    flexible_pct: pctFlexivel(carga),
  };
  const chavePerfil = `${perfil.monthly_kwh}|${perfil.customer_type}|${perfil.flexible_pct}`;

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    simularRegiao(preset, perfil)
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
  }, [regionId, chavePerfil]);

  const value: ClienteState = {
    plano,
    setPlano: (id) => {
      setPlanoId(id);
      gravarStorage("predicta-plano", id);
    },
    preset,
    setRegionId: (id) => {
      setRegionIdState(id);
      gravarStorage("predicta-regiao", id);
    },
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
      gravarStorage(`predicta-carga-${planoId}`, JSON.stringify(c));
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
