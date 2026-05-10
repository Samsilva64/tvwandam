import Image from "next/image";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import type { Program } from "@/lib/types";

export const metadata = {
  title: "Conteúdos",
  description: "Vídeos, Shorts, podcasts e playlists da TV WANDAM organizados por categoria.",
};

export default async function ProgramasPage() {
  const programs = await fetchJson<Program[]>("/programs", { next: { revalidate: 30 } });
  const groups = (programs ?? []).reduce<Record<string, Program[]>>((acc, program) => {
    const category = program.category || "Outros";
    acc[category] = [...(acc[category] ?? []), program];
    return acc;
  }, {});
  const categoryOrder = ["YouTube", "Shorts", "Podcasts", "Playlists", "Musica", "Serviço público", "Publicidade", "Humor"];
  const categories = Object.keys(groups).sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b, "pt");
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--brand-yellow)] sm:text-5xl">Conteúdos</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Vídeos, Shorts, podcasts e playlists publicados pela TV Wandam, organizados por categoria.
      </p>

      <div className="mt-10 space-y-12">
        {categories.map((category) => (
          <section key={category}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 gap-y-2">
              <h2 className="min-w-0 max-w-full break-words font-[family-name:var(--font-display)] text-2xl text-white sm:text-3xl">
                {category}
              </h2>
              <span className="shrink-0 text-xs text-white/45">{groups[category].length} secções</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {groups[category].map((p) => (
                <Link
                  key={p.id}
                  href={`/programas/${p.id}`}
                  className="group overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] ring-1 ring-[rgba(255,255,255,0.08)] transition hover:border-[var(--brand-yellow)]/35"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-xs uppercase tracking-wider text-[var(--brand-yellow)]">{p.category}</p>
                      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-none">{p.title}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{p.description}</p>
                      {p._count && (
                        <p className="mt-3 text-xs text-white/50">{p._count.episodes} conteúdos</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {!categories.length && (
          <p className="text-sm text-white/55">
            Ainda não há conteúdos sincronizados. Rode o sincronizador do YouTube no backend.
          </p>
        )}
      </div>
    </div>
  );
}
