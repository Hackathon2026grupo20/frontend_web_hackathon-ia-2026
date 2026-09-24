import Link from "next/link";

export default function Landing() {
  return (
    <div data-theme="landing" className="min-h-screen bg-bg text-text font-body">
      {/* Header */}
      <header className="max-w-5xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
        <span className="font-display font-extrabold text-xl">Predicta</span>
        <Link href="/login" className="text-sm text-dim hover:text-text transition-colors">
          Já é cliente? Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 pt-12 pb-16 text-center">
        <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-tight mb-5">
          Saiba quando vale a pena{" "}
          <span style={{ color: "var(--accent-demand)" }}>consumir</span>,{" "}
          <span style={{ color: "var(--accent-good)" }}>deslocar</span> ou reduzir carga
        </h1>
        <p className="text-dim text-lg mb-8 max-w-xl mx-auto">
          A Predicta cruza histórico elétrico, clima e contexto territorial pra prever a pressão do
          sistema nas próximas 24 horas — e traduz isso em decisão prática pro seu negócio.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/demo"
            className="px-6 py-3 rounded-card font-medium text-white transition-transform hover:scale-[1.02]"
            style={{ background: "var(--accent-demand)" }}
          >
            Solicitar demonstração
          </Link>
          <Link href="/login" className="px-6 py-3 rounded-card font-medium border border-border">
            Ver o produto
          </Link>
        </div>
      </section>

      {/* O problema */}
      <section className="bg-panel border-y border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-14">
          <p className="text-xs font-mono text-dim mb-2">O problema</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-4">
            A transição energética tornou a demanda mais difícil de prever
          </h2>
          <p className="text-dim leading-relaxed">
            Mais renováveis, mais geração distribuída, mais eletrificação — o sistema elétrico ficou
            mais dinâmico, e o clima passou a pesar tanto na oferta quanto no consumo. Empresas com
            cargas flexíveis raramente sabem, com antecedência, quando um pico vai acontecer e por quê
            — e acabam pagando mais caro por isso.
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <p className="text-xs font-mono text-dim mb-2 text-center">Como funciona</p>
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-10 text-center">
          Do dado bruto à decisão, em quatro passos
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { n: "01", t: "Identificamos sua distribuidora", d: "A partir da sua unidade cadastrada, sabemos a tarifa e o subsistema elétrico corretos." },
            { n: "02", t: "Cruzamos clima e histórico", d: "Dados reais do ONS, ANEEL e reanálise climática — não estimativa genérica." },
            { n: "03", t: "Prevemos a pressão do sistema", d: "As próximas 24 horas, com faixa de incerteza — não um número solto." },
            { n: "04", t: "Recomendamos quando agir", d: "Quando deslocar carga flexível pra pagar menos, com transparência total." },
          ].map((s) => (
            <div key={s.n}>
              <span className="font-display text-3xl" style={{ color: "var(--accent-demand)" }}>{s.n}</span>
              <h3 className="font-display font-bold mt-2 mb-1.5">{s.t}</h3>
              <p className="text-sm text-dim leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por que confiar */}
      <section className="bg-panel border-y border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          <p className="text-xs font-mono text-dim mb-2 text-center">Por que confiar</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-10 text-center">
            Honestos sobre o que sabemos — e sobre o que ainda não sabemos
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display font-bold mb-1.5" style={{ color: "var(--accent-good)" }}>Dado real, não estimado</h3>
              <p className="text-sm text-dim leading-relaxed">
                ONS, ANEEL e SIGA — carga, geração e tarifa vêm de fonte oficial, auditável.
              </p>
            </div>
            <div>
              <h3 className="font-display font-bold mb-1.5" style={{ color: "var(--accent-demand)" }}>Incerteza à vista</h3>
              <p className="text-sm text-dim leading-relaxed">
                Quando um dado é aproximado, mostramos isso na tela — nunca fingimos precisão que não existe.
              </p>
            </div>
            <div>
              <h3 className="font-display font-bold mb-1.5" style={{ color: "var(--accent-climate)" }}>Arquitetura auditável</h3>
              <p className="text-sm text-dim leading-relaxed">
                Previsão e tarifa são camadas separadas — cada decisão é explicável, não uma caixa-preta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-6">
          Quer ver a Predicta com os dados da sua operação?
        </h2>
        <Link
          href="/demo"
          className="inline-block px-6 py-3 rounded-card font-medium text-white"
          style={{ background: "var(--accent-demand)" }}
        >
          Solicitar demonstração
        </Link>
      </section>

      <footer className="text-xs text-dim text-center py-8 border-t border-border">
        Predicta · Hackathon COPPE IA 2026
      </footer>
    </div>
  );
}
