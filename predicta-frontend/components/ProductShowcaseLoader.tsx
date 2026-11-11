"use client";

import dynamic from "next/dynamic";

// ssr:false precisa de uma fronteira de Client Component — por isso este loader existe
// separado da página (Server Component) que o importa.
const ProductShowcase = dynamic(() => import("@/components/ProductShowcase"), {
  ssr: false,
  loading: () => <div className="h-[360px] rounded-xl border border-white/10 bg-white/5 animate-pulse" />,
});

export function ProductShowcaseLoader() {
  return <ProductShowcase />;
}
