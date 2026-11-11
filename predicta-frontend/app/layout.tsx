import "./globals.css";
import type { Metadata } from "next";

const TITLE = "Predicta — Inteligência de demanda para o setor elétrico";
const DESCRIPTION =
  "A Predicta prevê a pressão de demanda elétrica das próximas 24 horas, cruzando dados do ONS, clima e calendário, e simula uma tarifa dinâmica experimental que indica os melhores horários pra consumir ou deslocar carga.";

// Base absoluta para og:image/twitter:image. Prioridade: NEXT_PUBLIC_SITE_URL (domínio
// próprio, quando houver) → domínio de produção injetado pela Vercel → localhost em dev.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Predicta" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
