import { LandingNav } from "@/components/LandingNav";
import { DemoNaPraticaLoader } from "@/components/DemoNaPraticaLoader";
import { SiteFooter } from "@/components/SiteFooter";

const DIFERENCIAIS = [
  {
    t: "Dado real e público",
    d: "Carga, geração, clima e tarifa vêm de fontes públicas oficiais, nunca de estimativa genérica.",
  },
  {
    t: "Incerteza sempre visível",
    d: "Quando a previsão é aproximada, isso aparece na tela — nunca fingimos uma precisão que não existe.",
  },
  {
    t: "Método transparente",
    d: "Previsão e tarifa são camadas separadas e auditáveis, não uma caixa-preta.",
  },
  {
    t: "Guardrails na tarifa",
    d: "A tarifa dinâmica experimental opera com piso, teto, rampa e neutralidade controlados, com fallback pra tarifa-base.",
  },
  {
    t: "Confiança de localização",
    d: "Cada previsão respeita o subsistema elétrico e a distribuidora da unidade avaliada.",
  },
];

const FAQ = [
  {
    q: "O que a Predicta faz?",
    a: "Prevê a pressão de demanda elétrica das próximas 24 horas e simula uma tarifa dinâmica experimental que indica os horários mais e menos vantajosos pra consumir ou deslocar carga.",
  },
  {
    q: "De onde vêm os dados?",
    a: "De fontes públicas: ONS (carga e geração), Copernicus ERA5-Land (clima) e ANEEL (tarifas homologadas).",
  },
  {
    q: "A tarifa dinâmica é homologada?",
    a: "Não. É uma simulação experimental construída sobre a tarifa-base (TE + TUSD) homologada pela ANEEL.",
  },
  {
    q: "A Predicta promete economia?",
    a: "Não. A tarifa dinâmica é experimental e os dados de demonstração são ilustrativos — não há garantia de resultado financeiro.",
  },
  {
    q: "Como entrar em contato?",
    a: "Em breve.",
  },
];

export default function Landing() {
  return (
    <div id="top" data-theme="landing" className="min-h-screen bg-bg text-text font-body">
      <LandingNav />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 pt-10 pb-16 text-center">
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
          <a
            href="#produto"
            className="px-6 py-3 rounded-card font-medium text-white transition-transform hover:scale-[1.02]"
            style={{ background: "var(--accent-brand)" }}
          >
            Conhecer o produto
          </a>
          <span
            aria-disabled="true"
            className="px-6 py-3 rounded-card font-medium border border-border text-dim opacity-70 cursor-not-allowed"
          >
            Contato em breve
          </span>
        </div>
        <p className="text-xs text-dim mt-6">Vencedor do Hackathon IA COPPE 2026</p>
      </section>

      {/* O problema */}
      <section id="problema" className="bg-panel border-y border-border">
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

      {/* Produto */}
      <section id="produto" className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <p className="text-xs font-mono text-dim mb-2 text-center">Produto</p>
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-10 text-center">
          Previsão de demanda e tarifa dinâmica, numa só plataforma
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="border border-border rounded-card p-6">
            <h3 className="font-display font-bold text-lg mb-2">Previsão de pressão de demanda</h3>
            <p className="text-sm text-dim leading-relaxed mb-3">
              Para as próximas 24 horas, por subsistema elétrico (SE/CO, S, NE, N), com faixa de
              incerteza — p10, p50 e p90 — em vez de um número solto.
            </p>
            <details className="group">
              <summary
                className="text-sm font-medium cursor-pointer select-none list-none inline-flex items-center gap-1"
                style={{ color: "var(--accent-brand)" }}
              >
                Saiba mais
                <span className="transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
              </summary>
              <p className="text-sm text-dim leading-relaxed mt-2">
                A previsão cruza histórico de carga do ONS, variáveis climáticas e calendário. Em vez
                de um valor único, mostramos uma faixa — do cenário mais conservador (p10) ao mais
                extremo (p90) — pra deixar a incerteza visível, não escondida.
              </p>
            </details>
          </div>

          <div className="border border-border rounded-card p-6">
            <h3 className="font-display font-bold text-lg mb-2">Tarifa dinâmica experimental</h3>
            <span
              className="inline-block text-xs font-mono px-2 py-1 rounded-card mb-3"
              style={{ color: "var(--accent-demand)", background: "var(--accent-demand-glow)" }}
            >
              Experimental · não homologada pela ANEEL
            </span>
            <p className="text-sm text-dim leading-relaxed mb-3">
              Simula, sobre a tarifa-base homologada (TE + TUSD), um sinal de preço que varia com a
              pressão prevista do sistema.
            </p>
            <details className="group">
              <summary
                className="text-sm font-medium cursor-pointer select-none list-none inline-flex items-center gap-1"
                style={{ color: "var(--accent-brand)" }}
              >
                Saiba mais
                <span className="transition-transform group-open:rotate-180" aria-hidden="true">⌄</span>
              </summary>
              <p className="text-sm text-dim leading-relaxed mt-2">
                Opera com guardrails: piso e teto em torno da tarifa-base, rampa de variação limitada
                entre horas, neutralidade esperada no total do dia e fallback automático pra
                tarifa-base quando um dado não está disponível.
              </p>
            </details>
          </div>
        </div>

        <p className="text-xs font-mono text-dim mb-3 text-center">Visualização ilustrativa · dados sintéticos</p>
        <DemoNaPraticaLoader />
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="bg-panel border-y border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
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
                <span className="font-display text-3xl" style={{ color: "var(--accent-brand)" }}>{s.n}</span>
                <h3 className="font-display font-bold mt-2 mb-1.5">{s.t}</h3>
                <p className="text-sm text-dim leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <p className="text-xs font-mono text-dim mb-2 text-center">Diferenciais</p>
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-10 text-center">
          O que separa a Predicta de um número solto
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {DIFERENCIAIS.map((item) => (
            <div key={item.t}>
              <h3 className="font-display font-bold mb-1.5">{item.t}</h3>
              <p className="text-sm text-dim leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-panel border-y border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
          <p className="text-xs font-mono text-dim mb-2 text-center">FAQ</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-10 text-center">Perguntas frequentes</h2>
          <div className="flex flex-col divide-y divide-border border border-border rounded-card bg-panel">
            {FAQ.map((item) => (
              <details key={item.q} className="group p-4">
                <summary className="font-medium cursor-pointer select-none flex items-center justify-between gap-2 list-none">
                  {item.q}
                  <span className="text-dim transition-transform group-open:rotate-180" aria-hidden="true">
                    ⌄
                  </span>
                </summary>
                <p className="text-sm text-dim leading-relaxed mt-2">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
