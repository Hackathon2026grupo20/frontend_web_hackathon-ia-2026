interface TarifaBase {
  teRsMwh: number;
  tusdRsMwh: number;
  totalRsKwh: number;
  vigenciaInicio: string;
  vigenciaFim: string | null;
}

export function TariffPanel({ tarifa }: { tarifa: TarifaBase }) {
  return (
    <div className="bg-panel border border-border rounded-card p-5">
      <p className="text-xs text-dim mb-2 font-mono">Passo 3</p>
      <h2 className="font-display text-lg mb-3">Tarifa vigente (ANEEL)</h2>
      <div className="flex items-end gap-2 mb-3">
        <span className="font-display text-3xl text-text">
          R$ {tarifa.totalRsKwh.toFixed(5)}
        </span>
        <span className="text-sm text-dim mb-1">/ kWh</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-dim text-xs">TE</p>
          <p className="font-mono">R$ {tarifa.teRsMwh.toFixed(2)}/MWh</p>
        </div>
        <div>
          <p className="text-dim text-xs">TUSD</p>
          <p className="font-mono">R$ {tarifa.tusdRsMwh.toFixed(2)}/MWh</p>
        </div>
      </div>
      <p className="text-xs text-dim mt-3">
        Componente volumétrica (TE+TUSD). Não inclui tributos, bandeiras ou demanda contratada.
      </p>
    </div>
  );
}
