import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJson } from "@/lib/api";
import type { Artist, Post } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const artist = await fetchJson<Artist>(`/artists/${id}`, { next: { revalidate: 60 } });
  if (!artist) return { title: "Artista" };
  return {
    title: artist.name,
    description: artist.bio.slice(0, 160),
    openGraph: { title: artist.name, images: [{ url: artist.image }] },
  };
}

export default async function ArtistaPage({ params }: Props) {
  const { id } = await params;
  const [artist, posts] = await Promise.all([
    fetchJson<Artist & { episodes?: { id: string; title: string; thumbnail: string; program?: { title: string } }[] }>(
      `/artists/${id}`,
      { next: { revalidate: 30 } },
    ),
    fetchJson<Post[]>(`/posts?category=ENTREVISTAS&take=6`, { next: { revalidate: 60 } }),
  ]);
  if (!artist) notFound();

  const social = artist.socialLinks as Record<string, string>;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const whatsappText = encodeURIComponent(`Olá TV Wandam, quero contactar a equipa sobre ${artist.name}.`);
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${whatsappText}` : `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl ring-1 ring-white/10 lg:mx-0 lg:max-w-none">
          <Image src={artist.image} alt={artist.name} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 300px" />
        </div>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">{artist.name}</h1>
          <p className="mt-4 text-lg text-white/80">{artist.bio}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {Object.entries(social).map(([k, url]) => (
              <a
                key={k}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/10 hover:border-[#f20707]/40"
              >
                {k}
              </a>
            ))}
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-[#f20707] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c90606]"
          >
            Contactar no WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">Vídeos &amp; episódios</h2>
        <div className="row-scroll mt-6 flex gap-4 overflow-x-auto pb-2">
          {(artist.episodes ?? []).map((ep) => (
            <Link
              key={ep.id}
              href={`/episodios/${ep.id}`}
              className="w-[min(256px,85vw)] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] ring-1 ring-white/10"
            >
              <div className="relative aspect-video">
                <Image src={ep.thumbnail} alt={ep.title} fill className="object-cover" sizes="(max-width: 640px) 85vw, 256px" />
              </div>
              <div className="p-3 text-sm">
                <p className="text-xs text-white/50">{ep.program?.title}</p>
                <p className="mt-1 line-clamp-2 font-medium">{ep.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <h2 className="font-[family-name:var(--font-display)] text-3xl">Entrevistas</h2>
        <ul className="mt-6 space-y-3">
          {(posts ?? []).map((p) => (
            <li key={p.id}>
              <Link href={`/noticias/${p.slug}`} className="text-[#f20707] hover:text-white">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
