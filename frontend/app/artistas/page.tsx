import Image from "next/image";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import type { Artist } from "@/lib/types";

export const metadata = {
  title: "Artistas & talentos",
  description: "Perfis, redes sociais e conteúdos associados — base para booking e entrevistas.",
};

export default async function ArtistasPage() {
  const artists = await fetchJson<Artist[]>("/artists", { next: { revalidate: 60 } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--brand-yellow)] sm:text-5xl">Artistas</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">Perfis com bio, imagem e ligação com episódios e notícias.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(artists ?? []).map((a) => (
          <Link
            key={a.id}
            href={`/artistas/${a.id}`}
            className="group overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] ring-1 ring-[rgba(255,255,255,0.08)] transition hover:border-[var(--brand-yellow)]/40"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={a.image}
                alt={a.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-[family-name:var(--font-display)] text-2xl leading-none">{a.name}</p>
                <p className="mt-2 line-clamp-2 text-sm text-white/70">{a.bio}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
