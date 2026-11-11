import { LandingNav } from "@/components/LandingNav";
import { ProductShowcaseLoader } from "@/components/ProductShowcaseLoader";
import { SiteFooter } from "@/components/SiteFooter";
import { Picture } from "@/components/Picture";
import { Reveal } from "@/components/Reveal";
import { WaveDivider } from "@/components/WaveDivider";
import { SubsystemMap } from "@/components/SubsystemMap";
import {
  ForecastIcon,
  TariffIcon,
  PublicDataIcon,
  ModelIcon,
  PressureIcon,
  DecisionIcon,
  MeterCheckIcon,
  LocationIcon,
} from "@/components/icons";
import { CONTACT_EMAIL, hasContactEmail } from "@/lib/config";
import { imageExists } from "@/lib/images";

// Cada card tem uma foto (quando o arquivo existe em public/images/) ou uma ilustração em linha,
// pra nenhum card parecer que está sem imagem.
// [PREENCHER foto]: metodo.jpg — ideia: eletricista conferindo o medidor/quadro de luz (licença livre).
// [PREENCHER foto]: localizacao.jpg — opcional; a ilustração cobre enquanto não houver foto.
const DIFERENCIAIS = [
  {
    t: "Dado real e público",
    d: "Carga, geração, clima e tarifa vêm de fontes públicas oficiais, nunca de estimativa genérica.",
    img: "transmissao.jpg",
    Icon: PublicDataIcon,
  },
  {
    t: "Incerteza sempre visível",
    d: "Quando a previsão é aproximada, isso aparece na tela — nunca fingimos uma precisão que não existe.",
    img: "cidade-noite.jpg",
    Icon: PressureIcon,
  },
  {
    t: "Método transparente",
    d: "Previsão e tarifa são camadas separadas e auditáveis, não uma caixa-preta.",
    img: "metodo.jpg",
    Icon: MeterCheckIcon,
  },
  {
    t: "Guardrails na tarifa",
    d: "A tarifa dinâmica experimental opera com piso, teto, rampa e neutralidade controlados, com fallback pra tarifa-base.",
    img: "solar.jpg",
    Icon: TariffIcon,
  },
  {
    t: "Confiança de localização",
    d: "Cada previsão respeita o subsistema elétrico e a distribuidora da unidade avaliada.",
    img: "localizacao.jpg",
    Icon: LocationIcon,
  },
];

const COMO_FUNCIONA = [
  { n: "01", t: "Identificamos sua distribuidora", d: "A partir da sua unidade cadastrada, sabemos a tarifa e o subsistema elétrico corretos.", Icon: PublicDataIcon },
  { n: "02", t: "Cruzamos clima e histórico", d: "Dados reais do ONS, ANEEL e reanálise climática — não estimativa genérica.", Icon: ModelIcon },
  { n: "03", t: "Prevemos a pressão do sistema", d: "As próximas 24 horas, com faixa de incerteza — não um número solto.", Icon: PressureIcon },
  { n: "04", t: "Recomendamos quando agir", d: "Quando deslocar carga flexível pra pagar menos, com transparência total.", Icon: DecisionIcon },
];

const FAQ_CONTATO_RESPOSTA = hasContactEmail ? `Escreva para ${CONTACT_EMAIL}.` : "O canal de contato será divulgado em breve.";

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
    a: FAQ_CONTATO_RESPOSTA,
  },
];

export default function Landing() {
  return (
    <div id="top" data-theme="landing" className="min-h-screen bg-bg text-text font-body">
      <LandingNav />

      {/* Hero */}
      <section data-theme="operacao" className="relative min-h-[80vh] flex items-center overflow-hidden">
        <Picture
          src="eolica.jpg"
          alt="Parque eólico sob céu azul"
          fill
          priority
          className="object-cover"
          gradientClassName="bg-gradient-to-br from-[#0a0f1c] via-[#141b2e] to-[#1a2138]"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(10,15,28,0.55) 0%, rgba(10,15,28,0.88) 100%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 pt-28 pb-20 text-center">
          <h1 className="font-display font-extrabold text-white leading-[1.05] tracking-tight text-[clamp(2.75rem,6vw,4rem)] mb-6">
            Saiba quando vale a pena{" "}
            <span style={{ color: "var(--accent-demand)" }}>consumir</span>,{" "}
            <span style={{ color: "var(--accent-good)" }}>deslocar</span> ou reduzir carga
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-9 max-w-xl mx-auto leading-relaxed">
            A Predicta cruza histórico elétrico, clima e contexto territorial pra prever a pressão do
            sistema nas próximas 24 horas — e traduz isso em decisão prática pro seu negócio.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <a
              href="#produto"
              className="px-7 py-3.5 rounded-card font-medium text-white transition-transform hover:scale-[1.02]"
              style={{ background: "var(--accent-brand)" }}
            >
              Conhecer o produto
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-white/80 hover:text-white underline underline-offset-4">
              Como funciona
            </a>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap text-xs text-white/50 mt-10">
            <span>Vencedor do Hackathon IA COPPE 2026</span>
            <span aria-hidden="true">•</span>
            <span>Dados de ONS · Copernicus ERA5-Land · ANEEL</span>
          </div>
          {/* [PREENCHER logos]: usar os logos oficiais de ONS / Copernicus / ANEEL aqui somente após confirmação de uso */}
        </div>
      </section>

      {/* O problema */}
      <section id="problema" className="bg-panel border-b border-border">
        <Reveal className="max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-mono text-dim mb-2">O problema</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl mb-4 tracking-tight">
              A transição energética tornou a demanda mais difícil de prever
            </h2>
            <p className="text-dim leading-relaxed">
              Mais renováveis, mais geração distribuída, mais eletrificação — o sistema elétrico ficou
              mais dinâmico, e o clima passou a pesar tanto na oferta quanto no consumo. Empresas com
              cargas flexíveis raramente sabem, com antecedência, quando um pico vai acontecer e por quê
              — e acabam pagando mais caro por isso.
            </p>
          </div>
          <Picture
            src="transmissao.jpg"
            alt="Torres de transmissão de energia"
            width={640}
            height={480}
            className="rounded-card w-full h-64 md:h-80 object-cover"
          />
        </Reveal>
      </section>

      {/* Produto */}
      {/* text-text aqui é obrigatório: a cor herdada do topo já vem calculada no tema claro */}
      <section id="produto" data-theme="operacao" className="relative bg-bg text-text">
        <Reveal className="max-w-4xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <p className="text-xs font-mono text-dim mb-2 text-center">Produto</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-10 text-center tracking-tight">
            Previsão de demanda e tarifa dinâmica, numa só plataforma
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-panel2 border border-border rounded-card p-6 transition-transform hover:-translate-y-1">
              <ForecastIcon className="h-7 w-7 mb-3" style={{ color: "var(--accent-brand)" }} />
              <h3 className="font-display font-bold text-lg mb-2">Previsão de pressão de demanda</h3>
              <p className="text-base text-dim leading-relaxed mb-3">
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
                <p className="text-base text-dim leading-relaxed mt-2">
                  A previsão cruza histórico de carga do ONS, variáveis climáticas e calendário. Em vez
                  de um valor único, mostramos uma faixa — do cenário mais conservador (p10) ao mais
                  extremo (p90) — pra deixar a incerteza visível, não escondida.
                </p>
              </details>
            </div>

            <div className="bg-panel2 border border-border rounded-card p-6 transition-transform hover:-translate-y-1">
              <TariffIcon className="h-7 w-7 mb-3" style={{ color: "var(--accent-demand)" }} />
              <h3 className="font-display font-bold text-lg mb-2">Tarifa dinâmica experimental</h3>
              <span
                className="inline-block text-xs font-mono px-2 py-1 rounded-card mb-3"
                style={{ color: "var(--accent-demand)", background: "var(--accent-demand-glow)" }}
              >
                Experimental · não homologada pela ANEEL
              </span>
              <p className="text-base text-dim leading-relaxed mb-3">
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
                <p className="text-base text-dim leading-relaxed mt-2">
                  Opera com guardrails: piso e teto em torno da tarifa-base, rampa de variação limitada
                  entre horas, neutralidade esperada no total do dia e fallback automático pra
                  tarifa-base quando um dado não está disponível.
                </p>
              </details>
            </div>
          </div>

          <ProductShowcaseLoader />

          <div className="mt-16">
            <p className="text-xs font-mono text-dim mb-6 text-center">Subsistemas elétricos cobertos</p>
            <SubsystemMap />
          </div>
        </Reveal>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="bg-bg">
        <Reveal className="max-w-4xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <p className="text-xs font-mono text-dim mb-2 text-center">Como funciona</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-10 text-center tracking-tight">
            Do dado bruto à decisão, em quatro passos
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {COMO_FUNCIONA.map((s) => (
              <div key={s.n}>
                <s.Icon className="h-7 w-7 mb-3" style={{ color: "var(--accent-brand)" }} />
                <span className="font-display text-2xl block mb-1" style={{ color: "var(--accent-brand)" }}>{s.n}</span>
                <h3 className="font-display font-bold mt-1 mb-1.5">{s.t}</h3>
                <p className="text-sm text-dim leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="bg-panel border-y border-border">
        <Reveal className="max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <p className="text-xs font-mono text-dim mb-2 text-center">Diferenciais</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-12 text-center tracking-tight">
            O que separa a Predicta de um número solto
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {DIFERENCIAIS.map((item) => (
              <div
                key={item.t}
                className="bg-bg border border-border rounded-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                {imageExists(item.img) ? (
                  <Picture
                    src={item.img}
                    alt=""
                    width={200}
                    height={120}
                    className="rounded-card w-full h-24 object-cover mb-4"
                  />
                ) : (
                  <div
                    className="rounded-card w-full h-24 mb-4 flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] to-[#1a2138]"
                    aria-hidden="true"
                  >
                    <item.Icon className="h-9 w-9" style={{ color: "#8b8df7" }} />
                  </div>
                )}
                <h3 className="font-display font-bold mb-1.5">{item.t}</h3>
                <p className="text-sm text-dim leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Faixa de imagem full-width */}
      <section data-theme="operacao" className="relative h-[42vh] min-h-[280px] overflow-hidden">
        <Picture
          src="cidade-noite.jpg"
          alt="Vista noturna de uma cidade iluminada"
          fill
          className="object-cover"
          gradientClassName="bg-gradient-to-br from-[#0a0f1c] via-[#141b2e] to-[#1a2138]"
        />
        <div className="absolute inset-0" style={{ background: "rgba(10,15,28,0.6)" }} />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <p className="font-display font-bold text-white text-xl md:text-2xl max-w-xl tracking-tight">
            Decisões de consumo, tomadas antes do pico acontecer.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-panel">
        <Reveal className="max-w-3xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <p className="text-xs font-mono text-dim mb-2 text-center">FAQ</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-10 text-center tracking-tight">Perguntas frequentes</h2>
          <div className="flex flex-col divide-y divide-border border border-border rounded-card bg-bg">
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
        </Reveal>
      </section>

      <WaveDivider fill="#0a0f1c" />
      <SiteFooter />
    </div>
  );
}
