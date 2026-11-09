import { LandingNav } from "@/components/LandingNav";
import { DemoNaPraticaLoader } from "@/components/DemoNaPraticaLoader";

const EQUIPE = [
  { nome: "Larissa Pinheiro", papel: "Especialista" },
  { nome: "Ricardo Fernandes", papel: "Scrum Master" },
  { nome: "Raul Castro", papel: "Dev" },
  { nome: "Pedro Costa", papel: "Dev" },
  { nome: "Rômulo Goes", papel: "Dev" },
];

const LINK_RECONHECIMENTO =
  "https://coppe.ufrj.br/planeta-coppe/hackathon-ia-2026-transforma-desafios-reais-da-energia-em-solucoes-tecnologicas/";

export default function Landing() {
  return (
    <div id="top" data-theme="landing" className="min-h-screen bg-bg text-text font-body">
      <LandingNav />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 pt-10 pb-16 text-center">
        <a
          href="#reconhecimento"
          className="inline-block text-xs font-mono font-medium px-3 py-1.5 rounded-card mb-6 border"
          style={{ color: "var(--accent-good)", borderColor: "var(--accent-good)", background: "var(--accent-good-glow)" }}
        >
          🏆 Vencedor — Hackathon IA COPPE 2026
        </a>
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
            href="#reconhecimento"
            className="px-6 py-3 rounded-card font-medium text-white transition-transform hover:scale-[1.02]"
            style={{ background: "var(--accent-brand)" }}
          >
            Ver a premiação
          </a>
          <a href="#contato" className="px-6 py-3 rounded-card font-medium border border-border">
            Fale com a equipe
          </a>
        </div>
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

      {/* Como funciona */}
      <section id="como-funciona" className="max-w-4xl mx-auto px-4 md:px-8 py-16">
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
      </section>

      {/* Veja na prática */}
      <section id="na-pratica" className="bg-panel border-y border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          <p className="text-xs font-mono text-dim mb-2 text-center">Veja na prática</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-3 text-center">
            Previsão e deslocamento de carga, em duas unidades de exemplo
          </h2>
          <p className="text-dim text-center max-w-2xl mx-auto mb-8">
            Escolha uma unidade de exemplo e veja como a Predicta traduz a tarifa dinâmica prevista em
            um horário concreto pra deslocar carga flexível.
          </p>
          <DemoNaPraticaLoader />
        </div>
      </section>

      {/* Reconhecimento */}
      <section id="reconhecimento" className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        <p className="text-xs font-mono text-dim mb-2 text-center">Reconhecimento</p>
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-6 text-center">
          Hackathon IA COPPE 2026 — 1º lugar
        </h2>
        <div className="bg-panel border border-border rounded-card p-6 md:p-8">
          <p className="text-dim leading-relaxed mb-4">
            A equipe <b className="text-text">Atanora</b> conquistou o <b className="text-text">1º lugar</b> no{" "}
            <b className="text-text">Hackathon IA COPPE 2026</b> com a Predicta, tecnologia que usa inteligência
            artificial para antecipar picos de demanda e indicar momentos de menor custo e maior eficiência para o
            consumo de energia. O evento foi promovido pela{" "}
            <b className="text-text">Incubadora de Empresas da Coppe/UFRJ</b> e pela{" "}
            <b className="text-text">Made in Rio</b>, em parceria com o Operador Nacional do Sistema Elétrico (ONS),
            a AWS, o LNCC e a Prefeitura do Rio de Janeiro.
          </p>
          <p className="text-dim leading-relaxed mb-4">
            O desafio proposto às equipes foi usar dados reais e inteligência artificial para enfrentar problemas
            concretos da transição energética — do desperdício de energia renovável à redução do uso de usinas
            termelétricas. A Predicta respondeu a esse desafio do lado da demanda: prevendo pressão no sistema
            elétrico e traduzindo essa previsão em decisões práticas de quando consumir, deslocar ou reduzir carga.
          </p>
          <a
            href={LINK_RECONHECIMENTO}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium inline-flex items-center gap-1"
            style={{ color: "var(--accent-brand)" }}
          >
            Ler a matéria oficial da Coppe/UFRJ →
          </a>
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
                ONS, ANEEL e SIGA (Sistema de Informações de Geração da ANEEL) — carga, geração e tarifa vêm de
                fonte oficial, auditável.
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

      {/* Próximos passos */}
      <section id="proximos-passos" className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        <p className="text-xs font-mono text-dim mb-2 text-center">Próximos passos</p>
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-4 text-center">
          O que os créditos AWS do hackathon vão viabilizar
        </h2>
        <p className="text-dim leading-relaxed mb-8 text-center max-w-2xl mx-auto">
          Hoje a Predicta é um MVP funcional, com a validação mais aprofundada feita até agora no subsistema
          Sudeste/Centro-Oeste. Os créditos recebidos como prêmio do hackathon vão custear três frentes:
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-border rounded-card p-5">
            <h3 className="font-display font-bold mb-1.5">Hospedagem</h3>
            <p className="text-sm text-dim leading-relaxed">
              Rodar a aplicação e a API da Predicta em infraestrutura própria, saindo do ambiente de
              desenvolvimento atual.
            </p>
          </div>
          <div className="border border-border rounded-card p-5">
            <h3 className="font-display font-bold mb-1.5">Processamento e modelos</h3>
            <p className="text-sm text-dim leading-relaxed">
              Processar dados e treinar os modelos de previsão, ampliando a validação para os quatro
              subsistemas elétricos e para mais anos de histórico.
            </p>
          </div>
          <div className="border border-border rounded-card p-5">
            <h3 className="font-display font-bold mb-1.5">Dados públicos</h3>
            <p className="text-sm text-dim leading-relaxed">
              Armazenar e manter atualizados os dados públicos usados na previsão — ONS, clima e ANEEL.
            </p>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section id="equipe" className="bg-panel border-y border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          <p className="text-xs font-mono text-dim mb-2 text-center">Equipe</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-10 text-center">Quem construiu a Predicta</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {EQUIPE.map((p) => (
              <div key={p.nome}>
                <p className="font-display font-bold">{p.nome}</p>
                <p className="text-sm text-dim">{p.papel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
        <h2 className="font-display font-bold text-2xl md:text-3xl mb-3">Contato</h2>
        <p className="text-dim">Contato em breve.</p>
      </section>

      <footer className="text-xs text-dim border-t border-border">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p>Predicta · Hackathon IA COPPE 2026 · contato em breve</p>
          <nav className="flex gap-4 flex-wrap" aria-label="Seções da página">
            <a href="#problema" className="hover:text-text transition-colors">Problema</a>
            <a href="#como-funciona" className="hover:text-text transition-colors">Como funciona</a>
            <a href="#na-pratica" className="hover:text-text transition-colors">Veja na prática</a>
            <a href="#reconhecimento" className="hover:text-text transition-colors">Reconhecimento</a>
            <a href="#proximos-passos" className="hover:text-text transition-colors">Próximos passos</a>
            <a href="#equipe" className="hover:text-text transition-colors">Equipe</a>
            <a href="#contato" className="hover:text-text transition-colors">Contato</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
