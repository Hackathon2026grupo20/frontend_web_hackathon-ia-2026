"use client";

import { useRef, useState } from "react";
import { ApiError, uploadDataset } from "@/lib/api";
import type { DatasetUploadResponse, UploadDataset } from "@/types/api";

const DATASETS: { id: UploadDataset; label: string }[] = [
  { id: "load", label: "Carga (load)" },
  { id: "supply", label: "Oferta (supply)" },
  { id: "tariffs", label: "Tarifas ANEEL" },
  { id: "climate_e3", label: "Clima E3" },
];

export function DatasetUploadForm() {
  const [dataset, setDataset] = useState<UploadDataset>("load");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<DatasetUploadResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setEnviando(true);
    setErro(null);
    setResultado(null);
    try {
      const res = await uploadDataset(dataset, file);
      setResultado(res);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha no upload.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <h2 className="font-display font-bold text-lg mb-1">Upload de dataset</h2>
      <p className="text-xs text-alert mb-4">
        ⚠ Sobrescreve o arquivo direto no backend, sem merge nem validação de schema. Um arquivo com colunas
        erradas quebra a simulação até subir um válido de novo.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={dataset}
          onChange={(e) => setDataset(e.target.value as UploadDataset)}
          className="bg-panel2 border border-border rounded-card px-3 py-2 text-text text-sm"
        >
          {DATASETS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.parquet,.json"
          className="text-sm text-dim flex-1"
        />
      </div>

      <button
        type="button"
        disabled={enviando}
        onClick={handleUpload}
        className="px-4 py-2 rounded-card font-medium text-white disabled:opacity-50"
        style={{ background: "var(--accent-brand)" }}
      >
        {enviando ? "Enviando…" : "Enviar arquivo"}
      </button>

      {erro && <p className="text-sm text-alert mt-3">{erro}</p>}
      {resultado && (
        <p className="text-sm text-good mt-3">
          Upload ok — {resultado.rows} linhas, {resultado.columns.length} colunas ({resultado.path}).
        </p>
      )}
    </div>
  );
}
