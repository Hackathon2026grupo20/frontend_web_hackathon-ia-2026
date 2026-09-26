"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LocationPicker } from "@/components/LocationPicker";
import { DistributorCard } from "@/components/DistributorCard";
import { TariffPanel } from "@/components/TariffPanel";
import { ForecastChart } from "@/components/ForecastChart";
import { TariffComparisonChart } from "@/components/TariffComparisonChart";
import { LoadShiftBar } from "@/components/LoadShiftBar";
import { ReplayWindowPicker } from "@/components/ReplayWindowPicker";
import { ApiError, getSimulationOptions, runSimulation } from "@/lib/api";
import { REGIONS_DEMO, findRegionPreset } from "@/lib/regions";
import type { ReplayWindow, SimulationResponse } from "@/types/api";

export default function Dashboard() {
  const [regionId, setRegionId] = useState(REGIONS_DEMO[0].id);
  const [agora, setAgora] = useState<Date | null>(null);

  const [replayWindows, setReplayWindows] = useState<ReplayWindow[]>([]);
  const [replayKey, setReplayKey] = useState(""); // "" = mais recente disponível (backend usa a última janela)

  const [simulacao, setSimulacao] = useState<SimulationResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const preset = findRegionPreset(regionId);

  useEffect(() => {
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  // Ao trocar de região, busca as janelas de replay disponíveis e reseta pra "mais recente".
  useEffect(() => {
    let cancelado = false;
    setReplayWindows([]);
    setReplayKey("");
    getSimulationOptions(preset.request.region, "replay")
      .then((opts) => {
        if (!cancelado) setReplayWindows(opts.replay_windows ?? []);
      })
      .catch(() => {
        // Falha aqui não é crítica — o formulário de simulação ainda tenta rodar com a janela mais recente.
      });
    return () => {
      cancelado = true;
    };
  }, [regionId]);

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    runSimulation({ ...preset.request, replay_key: replayKey || undefined })
      .then((data) => {
        if (!cancelado) setSimulacao(data);
      })
      .catch((e) => {
        if (cancelado) return;
        setSimulacao(null);
        setErro(e instanceof ApiError ? e.message : "Não foi possível carregar a simulação.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [regionId, replayKey]);

  return (
    <div data-theme="operacao" className="min-h-screen bg-bg text-text font-body">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <header className="mb-8 flex items-start justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-dim font-mono mb-1">dados da API Predicta</p>
            <h1 className="font-display font-extrabold text-2xl">Predicta</h1>
          </div>
          {agora && (
            <p className="text-xs text-dim font-mono mt-1 md:mt-2 capitalize">
              {agora.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              · {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          )}
          <Link href="/pipeline" className="text-sm text-dim hover:text-text transition-colors">
            Pipeline do modelo →
          </Link>
        </header>

        {/* Sidebar (contexto do cadastro — muda pouco) + conteúdo principal (dinâmico a cada consulta) */}
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-72 flex-shrink-0 flex flex-col gap-5">
            <LocationPicker regionId={regionId} onChange={setRegionId} />
            <DistributorCard preset={preset} />
            <ReplayWindowPicker windows={replayWindows} replayKey={replayKey} onChange={setReplayKey} />
            {simulacao && (
              <TariffPanel
                referenceMeanRsKwh={simulacao.reference_tariff_mean_rs_kwh}
                dynamicMeanRsKwh={simulacao.dynamic_tariff_mean_rs_kwh}
              />
            )}
          </aside>

          <main className="flex-1 min-w-0 flex flex-col gap-5">
            {carregando && (
              <div className="bg-panel border border-border rounded-card p-5 text-sm text-dim">
                Carregando simulação…
              </div>
            )}
            {erro && !carregando && (
              <div className="bg-panel border border-alert rounded-card p-5 text-sm text-alert">
                {erro} — verifique se a API está disponível em{" "}
                <code className="font-mono">
                  {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}
                </code>
                .
              </div>
            )}
            {simulacao && !carregando && !erro && (
              <>
                <p className="text-xs text-dim -mb-2">
                  Janela simulada confirmada pelo backend:{" "}
                  <span className="font-mono text-text">{simulacao.window.label}</span>
                </p>
                <ForecastChart hourly={simulacao.hourly} displayTimezone={simulacao.display_timezone} />
                <TariffComparisonChart hourly={simulacao.hourly} differencePct={simulacao.difference_pct} />
                <LoadShiftBar hourly={simulacao.hourly} />
              </>
            )}
          </main>
        </div>

        <footer className="text-xs text-dim text-center pt-8 mt-4 border-t border-border">
          Predicta · Hackathon COPPE IA 2026
        </footer>
      </div>
    </div>
  );
}
