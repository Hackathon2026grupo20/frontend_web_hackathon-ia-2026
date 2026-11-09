import "./globals.css";
import type { Metadata } from "next";

const TITLE = "Predicta";
const DESCRIPTION =
  "O Predicta prevê a demanda elétrica das próximas 24h, cruzando dados do ONS, clima e calendário. Com a tarifa-base homologada pela Aneel, simula tarifa dinâmica que indica horários pra transferir carga flexível.";

// TODO [PREENCHER]: quando o domínio de produção estiver definido, configurar metadataBase
// (ex.: NEXT_PUBLIC_SITE_URL) para que og:image resolva como URL absoluta nos crawlers sociais.
export const metadata: Metadata = {
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
