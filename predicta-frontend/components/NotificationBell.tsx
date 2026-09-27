"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCliente } from "@/components/ClienteProvider";
import { useNotificacoes } from "@/components/useNotificacoes";
import { labelIntervalo } from "@/lib/notificacoes";

const COR = { alerta: "var(--accent-alert)", oportunidade: "var(--accent-good)", info: "var(--accent-demand)" };

export function NotificationBell() {
  const { prefs, marcarLidas } = useCliente();
  const { entregas, naoLidas, chave } = useNotificacoes();
  const [aberto, setAberto] = useState(false);
  const [novasAoAbrir, setNovasAoAbrir] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const noApp = prefs.canais.includes("app");

  // Fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  function alternar() {
    if (!aberto) {
      // guarda quais eram novas para destacá-las, e marca tudo como lido
      setNovasAoAbrir(naoLidas);
      if (naoLidas.length) marcarLidas(naoLidas);
    }
    setAberto(!aberto);
  }

  const contador = noApp ? naoLidas.length : 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={alternar}
        className="relative w-10 h-10 grid place-items-center border border-border rounded-card hover:border-brand transition-colors"
        aria-label={contador ? `Notificações: ${contador} não lidas` : "Notificações"}
        aria-expanded={aberto}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {contador > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-bold grid place-items-center text-white"
            style={{ background: "var(--accent-alert)" }}
          >
            {contador > 9 ? "9+" : contador}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-12 w-[360px] max-w-[90vw] bg-panel2 border border-border rounded-card shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="font-display text-sm font-bold">Notificações</p>
              <p className="text-[11px] text-dim font-mono">
                {labelIntervalo(prefs.intervaloH)}
                {prefs.silencio.ativo && ` · silêncio ${prefs.silencio.inicio}h–${prefs.silencio.fim}h`}
              </p>
            </div>
            <Link href="/notificacoes" onClick={() => setAberto(false)} className="text-xs text-brand">
              Configurar
            </Link>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {!noApp ? (
              <p className="text-sm text-dim p-4">
                Notificações no app estão desligadas.{" "}
                <Link href="/notificacoes" className="text-brand underline" onClick={() => setAberto(false)}>
                  Ativar
                </Link>
              </p>
            ) : entregas.length === 0 ? (
              <p className="text-sm text-dim p-4">Nenhuma notificação para o dia com as suas preferências.</p>
            ) : (
              entregas.map((e) => (
                <div key={e.slotIdx} className="border-b border-border last:border-b-0">
                  <p className="text-[11px] text-dim font-mono px-4 pt-3">
                    entrega das {e.horario}
                    {e.adiadaPorSilencio && " · adiada pelo horário de silêncio"}
                  </p>
                  {e.avisos.map((a) => {
                    const nova = novasAoAbrir.includes(chave(a.id));
                    return (
                      <div key={a.id} className="flex gap-3 px-4 py-2.5">
                        <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: COR[a.nivel] }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {a.titulo}
                            {nova && (
                              <span className="ml-2 text-[10px] font-mono align-middle" style={{ color: "var(--accent-brand)" }}>
                                novo
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-dim">{a.detalhe}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
