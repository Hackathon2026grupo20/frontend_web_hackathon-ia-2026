import type { PipelineRun } from "@/types/api";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "var(--text-dim)",
  RUNNING: "var(--accent-demand)",
  SUCCESS: "var(--accent-good)",
  FAILED: "var(--accent-alert)",
};

export function PipelineRunStatus({ run }: { run: PipelineRun }) {
  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-lg">Execução {run.id}</h2>
        <span className="text-sm font-mono" style={{ color: STATUS_COLOR[run.status] ?? "var(--text)" }}>
          {run.status}
        </span>
      </div>
      {run.error_message && <p className="text-sm text-alert mb-3">{run.error_message}</p>}
      {run.log_tail && (
        <pre className="text-xs bg-panel2 border border-border rounded-card p-3 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
          {run.log_tail}
        </pre>
      )}
    </div>
  );
}
