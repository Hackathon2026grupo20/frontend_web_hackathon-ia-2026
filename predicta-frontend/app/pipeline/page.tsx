"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PipelineForm } from "@/components/PipelineForm";
import { PipelineRunStatus } from "@/components/PipelineRunStatus";
import { DatasetUploadForm } from "@/components/DatasetUploadForm";
import { ApiError, getPipelineRun, getPipelineStages, runPipelineStage } from "@/lib/api";
import type { PipelineRun, PipelineStage } from "@/types/api";

// Etapas relevantes pro fluxo de retreino/engenharia de features — o backend expõe ~22,
// as demais (sync de dados brutos etc.) ficam fora desse recorte de UI por enquanto.
const STAGE_IDS_RELEVANTES = ["validate_model", "train_model", "full_automation", "sync_ons_history", "prepare_tariff_geo"];

export default function Pipeline() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [stageId, setStageId] = useState<string | null>(null);
  const [carregandoStages, setCarregandoStages] = useState(true);
  const [erroStages, setErroStages] = useState<string | null>(null);

  const [run, setRun] = useState<PipelineRun | null>(null);
  const [erroRun, setErroRun] = useState<string | null>(null);

  useEffect(() => {
    getPipelineStages()
      .then((all) => {
        const relevantes = all.filter((s) => STAGE_IDS_RELEVANTES.includes(s.id));
        setStages(relevantes);
        setStageId(relevantes[0]?.id ?? null);
      })
      .catch((e) => setErroStages(e instanceof ApiError ? e.message : "Não foi possível carregar as etapas."))
      .finally(() => setCarregandoStages(false));
  }, []);

  useEffect(() => {
    if (!run || run.status === "SUCCESS" || run.status === "FAILED") return;
    const id = setTimeout(() => {
      getPipelineRun(run.id)
        .then(setRun)
        .catch((e) => setErroRun(e instanceof ApiError ? e.message : "Falha ao consultar a execução."));
    }, 2000);
    return () => clearTimeout(id);
  }, [run]);

  async function handleRun(params: Record<string, string>) {
    if (!stageId) return;
    setErroRun(null);
    setRun(null);
    try {
      const { id } = await runPipelineStage(stageId, params);
      const initial = await getPipelineRun(id);
      setRun(initial);
    } catch (e) {
      setErroRun(e instanceof ApiError ? e.message : "Não foi possível iniciar a execução.");
    }
  }

  const stage = stages.find((s) => s.id === stageId) ?? null;
  const rodando = run !== null && run.status !== "SUCCESS" && run.status !== "FAILED";

  return (
    <div data-theme="operacao" className="min-h-screen bg-bg text-text font-body">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
        <header className="mb-8 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-dim font-mono mb-1">retreino · engenharia de features</p>
            <h1 className="font-display font-extrabold text-2xl">Pipeline do modelo</h1>
          </div>
          <Link href="/dashboard" className="text-sm text-dim hover:text-text transition-colors">
            ← voltar ao dashboard
          </Link>
        </header>

        <div className="flex flex-col gap-5">
          {carregandoStages && (
            <div className="bg-panel border border-border rounded-card p-5 text-sm text-dim">Carregando etapas…</div>
          )}
          {erroStages && (
            <div className="bg-panel border border-alert rounded-card p-5 text-sm text-alert">{erroStages}</div>
          )}

          {stages.length > 0 && (
            <div className="bg-panel border border-border rounded-card p-5">
              <label className="block text-sm mb-1.5">Etapa</label>
              <select
                value={stageId ?? ""}
                onChange={(e) => {
                  setStageId(e.target.value);
                  setRun(null);
                }}
                className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-text"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.section} — {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {stage && <PipelineForm stage={stage} onRun={handleRun} disabled={rodando} />}

          {erroRun && <div className="bg-panel border border-alert rounded-card p-5 text-sm text-alert">{erroRun}</div>}

          {run && <PipelineRunStatus run={run} />}

          {run?.status === "SUCCESS" && stageId === "validate_model" && (
            <p className="text-sm text-dim">
              Validação concluída. Se o resultado for bom, rode a etapa <b>Treinar/congelar H01–H24</b> com os mesmos
              parâmetros para que as simulações passem a usar esse modelo.
            </p>
          )}

          <DatasetUploadForm />
        </div>
      </div>
    </div>
  );
}
