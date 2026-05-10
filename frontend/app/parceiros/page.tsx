import Image from "next/image";
import { fetchJson } from "@/lib/api";
import type { Partner } from "@/lib/types";

export const metadata = {
  title: "Parceiros",
  description: "Parceiros e marcas que comunicam com a comunidade guineense atraves da TV Wandam.",
};

const planCopy: Record<string, string> = {
  BRONZE: "Presenca em conteudos selecionados.",
  SILVER: "Destaque visual em paginas de maior audiencia.",
  GOLD: "Campanhas em video com distribuicao no site e redes sociais.",
  PLATINUM: "Cobertura completa com video, reportagem, redes sociais e destaque editorial.",
  LOCAL: "Apoio a iniciativas de bairro, regiao, tabanca e comunidade.",
};

export default async function ParceirosPage() {
  const partners = await fetchJson<Partner[]>("/partners", { next: { revalidate: 120 } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">Parceiros</h1>
      <p className="mt-3 max-w-2xl text-white/65">
        Marcas, instituicoes e projetos que escolhem uma comunicacao proxima das pessoas e da realidade da Guine-Bissau.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {(["BRONZE", "SILVER", "GOLD", "PLATINUM", "LOCAL"] as const).map((tier) => (
          <div key={tier} className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(25,25,25,0.8)] p-6 ring-1 ring-[rgba(255,255,255,0.08)]">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--brand-yellow)]">
              {tier.charAt(0) + tier.slice(1).toLowerCase()}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{planCopy[tier]}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 font-[family-name:var(--font-display)] text-3xl">Marcas ativas</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {(partners ?? []).map((p) => (
          <a
            key={p.id}
            href={p.website ?? "#"}
            target={p.website ? "_blank" : undefined}
            rel={p.website ? "noopener noreferrer" : undefined}
            className="flex flex-col items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 text-center ring-1 ring-[rgba(255,255,255,0.08)] transition hover:border-[var(--brand-yellow)]/40"
          >
            <Image src={p.logo} alt={p.name} width={140} height={80} className="h-12 w-auto object-contain opacity-90" />
            <span className="mt-3 text-xs text-[var(--muted)]">{p.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
