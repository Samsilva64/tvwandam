import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJson } from "@/lib/api";
import type { Episode, EpisodeWatchContext } from "@/lib/types";
import { VideoEmbed } from "@/components/VideoEmbed";
import { RegisterView } from "@/components/RegisterView";
import { EpisodeWatchControls, EpisodeWatchSidebar } from "@/components/EpisodeWatchSidebar";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ autoplay?: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const episode = await fetchJson<Episode>(`/episodes/${id}`, { next: { revalidate: 30 } });
  if (!episode) return { title: "Episódio" };
  return {
    title: episode.title,
    description: episode.description.slice(0, 160),
    openGraph: {
      title: episode.title,
      images: [{ url: episode.thumbnail }],
    },
  };
}

export default async function EpisodePage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const [episode, watchContext] = await Promise.all([
    fetchJson<Episode>(`/episodes/${id}`, { next: { revalidate: 30 } }),
    fetchJson<EpisodeWatchContext>(`/episodes/${id}/watch-context`, { next: { revalidate: 30 } }),
  ]);
  if (!episode) notFound();

  const anterior = watchContext?.anterior ?? null;
  const proximo = watchContext?.proximo ?? null;
  const aSeguir = watchContext?.aSeguir ?? [];
  const autoplay = query.autoplay === "1";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <RegisterView episodeId={episode.id} />
      <div className="grid gap-8 lg:grid-cols-[1.65fr_0.85fr] lg:items-start">
        <section>
          <div className="text-sm text-[var(--muted)]">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link href="/programas" className="inline text-[var(--foreground)] hover:text-white">
                Programas
              </Link>
              <span className="text-white/35">/</span>
              {episode.program && (
                <Link href={`/programas/${episode.program.id}`} className="inline break-words text-[var(--brand-yellow)] hover:text-[var(--foreground)]">
                  {episode.program.title}
                </Link>
              )}
            </span>
          </div>
          <h1 className="mt-4 break-words font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--brand-yellow)] sm:text-4xl lg:text-5xl">
            {episode.title}
          </h1>
          <p className="mt-3 text-white/65">
            {new Date(episode.publishedAt).toLocaleString("pt-PT")} · {episode.duration} ·{" "}
            <span className="text-white/80">{episode.views.toLocaleString("pt-PT")} visualizações</span>
          </p>
          <div className="mt-8">
            <VideoEmbed title={episode.title} embedUrl={episode.videoUrl} autoplay={autoplay} />
          </div>
          <EpisodeWatchControls anterior={anterior} proximo={proximo} />
          <p className="mt-8 text-lg text-white/80">{episode.description}</p>
          {episode.artists && episode.artists.length > 0 && (
            <div className="mt-10">
              <h2 className="font-[family-name:var(--font-display)] text-2xl">Talentos</h2>
              <div className="mt-4 flex flex-wrap gap-4">
                {episode.artists.map((a) => (
                  <Link
                    key={a.id}
                    href={`/artistas/${a.id}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-[#f20707]/35"
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-white/10">
                      <Image src={a.image} alt={a.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <span className="text-sm font-medium">{a.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        <EpisodeWatchSidebar aSeguir={aSeguir} />
      </div>
    </div>
  );
}
