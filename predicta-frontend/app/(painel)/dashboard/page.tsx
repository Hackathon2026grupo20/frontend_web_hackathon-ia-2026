"use client";

import { ClienteCard } from "@/components/ClienteCard";
import { DistributorCard } from "@/components/DistributorCard";
import { TariffPanel } from "@/components/TariffPanel";
import { TariffComparisonChart } from "@/components/TariffComparisonChart";
import { AlertsPanel } from "@/components/AlertsPanel";
import { AgendaCard } from "@/components/AgendaCard";
import { ReplayWindowPicker } from "@/components/ReplayWindowPicker";
import { EstadoSimulacao } from "@/components/AppShell";
import { useCliente } from "@/components/ClienteProvider";

export default function Dashboard() {
  const { preset, distribuidora, replayWindows, replayKey, setReplayKey, resultado, carregando, erro } = useCliente();
  const simulacao = resultado?.simulation ?? null;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Sidebar: quem é o cliente e o contrato dele — vem do perfil, não se escolhe aqui.
          Conteúdo principal: o que muda a cada consulta. */}
      <aside className="md:w-72 flex-shrink-0 flex flex-col gap-3">
        <ClienteCard />
        <DistributorCard
          distributor={resultado?.distributor ?? simulacao?.concession ?? null}
          profile={resultado?.profile ?? null}
          cnpj={distribuidora.cnpj}
          regiaoLabel={preset.label}
        />
        <ReplayWindowPicker windows={replayWindows} replayKey={replayKey} onChange={setReplayKey} />
        {simulacao && (
          <TariffPanel
            referenceMeanRsKwh={simulacao.reference_tariff_mean_rs_kwh}
            dynamicMeanRsKwh={simulacao.dynamic_tariff_mean_rs_kwh}
          />
        )}
      </aside>

      <main className="flex-1 min-w-0 flex flex-col gap-3">
        <EstadoSimulacao />
        {simulacao && !carregando && !erro && (
          <>
            <AlertsPanel />
            <AgendaCard />
            <p className="text-xs text-dim">{simulacao.simulation_scope_pt}</p>
            <TariffComparisonChart hourly={simulacao.hourly} differencePct={simulacao.difference_pct} />
          </>
        )}
      </main>
    </div>
  );
}
