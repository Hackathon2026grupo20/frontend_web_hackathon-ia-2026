export function TariffPanel({
  referenceMeanRsKwh,
  dynamicMeanRsKwh,
}: {
  referenceMeanRsKwh: number;
  dynamicMeanRsKwh: number;
}) {
  return (
    <div className="bg-panel border border-border rounded-card p-4">
      <h2 className="font-display text-lg mb-3">Tarifa (média 24h)</h2>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-dim text-xs">Referência</p>
          <p className="font-mono text-lg">R$ {referenceMeanRsKwh.toFixed(5)}</p>
        </div>
        <div>
          <p className="text-dim text-xs">Dinâmica</p>
          <p className="font-mono text-lg">R$ {dynamicMeanRsKwh.toFixed(5)}</p>
        </div>
      </div>
      <p className="text-xs text-dim mt-3">Médias das 24 horas simuladas, em R$/kWh.</p>
    </div>
  );
}
