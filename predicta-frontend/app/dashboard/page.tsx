"use client";

import { useState } from "react";
import { LocationPicker } from "@/components/LocationPicker";
import { DistributorCard } from "@/components/DistributorCard";
import { TariffPanel } from "@/components/TariffPanel";
import { ForecastChart } from "@/components/ForecastChart";
import { TariffComparisonChart } from "@/components/TariffComparisonChart";
import { LoadShiftBar } from "@/components/LoadShiftBar";
import { FILIAIS_DEMO, mockResolveLocation, mockSystemSignal, mockSimulacao, mockTarifaBase } from "@/lib/mockData";

export default function Home() {
  const [filialId, setFilialId] = useState(FILIAIS_DEMO[0].id);

  const distribuidora = mockResolveLocation(filialId);
  const tarifa = mockTarifaBase();
  const signal = mockSystemSignal(distribuidora.subsistema);
  const simulacao = mockSimulacao(distribuidora.subsistema);

  return (
    <div data-theme="operacao" className="min-h-screen bg-bg text-text font-body">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <header className="mb-8">
          <p className="text-xs text-dim font-mono mb-1">protótipo · dados mockados</p>
          <h1 className="font-display font-extrabold text-2xl">Predicta</h1>
        </header>

        {/* Sidebar (contexto do cadastro — muda pouco) + conteúdo principal (dinâmico a cada consulta) */}
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-72 flex-shrink-0 flex flex-col gap-5">
            <LocationPicker filialId={filialId} onChange={setFilialId} />
            <DistributorCard data={distribuidora} />
            <TariffPanel tarifa={tarifa} />
          </aside>

          <main className="flex-1 min-w-0 flex flex-col gap-5">
            <ForecastChart signal={signal} />
            <TariffComparisonChart sim={simulacao} />
            <LoadShiftBar sim={simulacao} />
          </main>
        </div>

        <footer className="text-xs text-dim text-center pt-8 mt-4 border-t border-border">
          Predicta · Hackathon COPPE IA 2026 — protótipo de interface, dados ilustrativos
        </footer>
      </div>
    </div>
  );
}
