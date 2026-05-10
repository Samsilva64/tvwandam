"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authFetch, setToken } from "@/lib/admin-api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@tvwandem.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setError(data.error ?? "Falha no login");
        return;
      }
      setToken(data.token);
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Não foi possível contactar a API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-3 py-10 sm:px-4 sm:py-14">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">Admin</h1>
      <p className="mt-2 text-sm text-white/55">Acesso reservado à equipa TV Wandam.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm text-white/70">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-white outline-none ring-0 focus:border-[#f20707]/60"
            autoComplete="username"
          />
        </label>
        <label className="block text-sm text-white/70">
          Senha
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 pr-10 text-white outline-none focus:border-[#f20707]/60"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              <i className={showPassword ? "bi-eye-slash" : "bi-eye"}></i>
            </button>
          </div>
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#f20707] py-3 text-sm font-semibold text-white hover:bg-[#c90606] disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/45">
        <Link href="/" className="text-[#f20707] hover:text-white">
          ← Voltar ao site
        </Link>
      </p>
    </div>
  );
}
