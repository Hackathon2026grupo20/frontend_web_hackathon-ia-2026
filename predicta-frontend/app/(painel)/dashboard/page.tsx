"use client";

import { LocationPicker } from "@/components/LocationPicker";
import { DistributorCard } from "@/components/DistributorCard";
import { TariffPanel } from "@/components/TariffPanel";
import { ForecastChart } from "@/components/ForecastChart";
import { TariffComparisonChart } from "@/components/TariffComparisonChart";
import { LoadShiftBar } from "@/components/LoadShiftBar";
import { AlertsPanel } from "@/components/AlertsPanel";
import { AgendaCard } from "@/components/AgendaCard";
import { FeatureGate } from "@/components/FeatureGate";
import { EstadoSimulacao } from "@/components/AppShell";
import { useCliente } from "@/components/ClienteProvider";

export default function Dashboard() {
  const { preset, setRegionId, resultado, carregando, erro } = useCliente();
  const simulacao = resultado?.simulation ?? null;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar (contexto do cadastro — muda pouco) + conteúdo principal (dinâmico a cada consulta) */}
      <aside className="md:w-72 flex-shrink-0 flex flex-col gap-5">
        <LocationPicker regionId={preset.id} onChange={setRegionId} />
        <DistributorCard
          preset={preset}
          distributor={resultado?.distributor ?? simulacao?.concession ?? null}
          profile={resultado?.profile ?? null}
        />
        {simulacao && (
          <TariffPanel
            referenceMeanRsKwh={simulacao.reference_tariff_mean_rs_kwh}
            dynamicMeanRsKwh={simulacao.dynamic_tariff_mean_rs_kwh}
          />
        )}
      </aside>

      <main className="flex-1 min-w-0 flex flex-col gap-5">
        <EstadoSimulacao />
        {simulacao && !carregando && !erro && (
          <>
            <AlertsPanel />
            <AgendaCard />
            <ForecastChart
              hourly={simulacao.hourly}
              displayTimezone={simulacao.display_timezone}
              mode={simulacao.simulation_mode}
            />
            <p className="text-xs text-dim">{simulacao.simulation_scope_pt}</p>
            <TariffComparisonChart hourly={simulacao.hourly} differencePct={simulacao.difference_pct} />
            <FeatureGate recurso="faixaDeslocamento">
              <LoadShiftBar hourly={simulacao.hourly} />
            </FeatureGate>
          </>
        )}
      </main>
    </div>
  );
}
