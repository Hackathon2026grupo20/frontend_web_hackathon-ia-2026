"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Sem autenticação real — é uma ponte demonstrativa pro dashboard.
    // Qualquer valor preenchido leva pra /dashboard.
    router.push("/dashboard");
  }

  return (
    <div data-theme="landing" className="min-h-screen bg-bg text-text font-body flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display font-extrabold text-xl block text-center mb-8">
          Predicta
        </Link>
        <form onSubmit={handleSubmit} className="bg-panel border border-border rounded-card p-6">
          <h1 className="font-display font-bold text-xl mb-1">Entrar</h1>
          <p className="text-sm text-dim mb-6">
            Protótipo de demonstração — qualquer e-mail e senha leva ao dashboard.
          </p>
          <label className="block text-sm mb-1.5">E-mail</label>
          <input
            type="email"
            required
            placeholder="voce@empresa.com"
            className="w-full bg-panel2 border border-border rounded-card px-3 py-2 mb-4 text-text"
          />
          <label className="block text-sm mb-1.5">Senha</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            className="w-full bg-panel2 border border-border rounded-card px-3 py-2 mb-6 text-text"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-card font-medium text-white"
            style={{ background: "var(--accent-brand)" }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
