"use client";

import { useState } from "react";
import type { PipelineParam, PipelineStage } from "@/types/api";

function defaultValues(stage: PipelineStage): Record<string, string> {
  const values: Record<string, string> = {};
  for (const p of stage.params) values[p.name] = p.default;
  return values;
}

function ParamField({
  param,
  value,
  onChange,
}: {
  param: PipelineParam;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{param.label}</label>
      {param.kind === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-text text-sm"
        >
          {param.choices.map(([choiceValue, choiceLabel]) => (
            <option key={choiceValue} value={choiceValue}>
              {choiceLabel}
            </option>
          ))}
        </select>
      ) : param.kind === "checkbox" ? (
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="w-4 h-4"
        />
      ) : (
        <input
          type={param.kind === "number" ? "number" : param.kind === "date" ? "date" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-panel2 border border-border rounded-card px-3 py-2 text-text text-sm font-mono"
        />
      )}
      {param.help && <p className="text-xs text-dim mt-1">{param.help}</p>}
    </div>
  );
}

export function PipelineForm({
  stage,
  onRun,
  disabled,
}: {
  stage: PipelineStage;
  onRun: (params: Record<string, string>) => void;
  disabled: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>(defaultValues(stage));

  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <h2 className="font-display font-bold text-lg mb-1">{stage.title}</h2>
      <p className="text-sm text-dim mb-1">{stage.summary}</p>
      <p className="text-xs text-dim mb-4">{stage.why}</p>

      {stage.required.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {stage.required.map((r) => (
            <span
              key={r.key}
              className={`text-xs px-2 py-1 rounded-card border ${
                r.exists ? "border-good text-good" : "border-alert text-alert"
              }`}
            >
              {r.exists ? "✓" : "✗"} {r.label}
            </span>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {stage.params.map((param) => (
          <ParamField
            key={param.name}
            param={param}
            value={values[param.name] ?? ""}
            onChange={(v) => setValues((prev) => ({ ...prev, [param.name]: v }))}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onRun(values)}
        className="px-4 py-2 rounded-card font-medium text-white disabled:opacity-50"
        style={{ background: "var(--accent-brand)" }}
      >
        {disabled ? "Executando…" : "Rodar etapa"}
      </button>
    </div>
  );
}
