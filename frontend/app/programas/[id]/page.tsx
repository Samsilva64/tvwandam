import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJson } from "@/lib/api";
import type { Program } from "@/lib/types";
import { ProgramFollowButton } from "@/components/ProgramFollowButton";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const program = await fetchJson<Program>(`/programs/${id}`, { next: { revalidate: 30 } });
  if (!program) return { title: "Programa" };
  return {
    title: program.title,
    description: program.description.slice(0, 160),
    openGraph: { title: program.title, images: [{ url: program.coverImage }] },
  };
}

export default async function ProgramPage({ params }: Props) {
  const { id } = await params;
  const program = await fetchJson<Program>(`/programs/${id}`, { next: { revalidate: 30 } });
  if (!program) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-[rgba(255,255,255,0.08)]">
            <Image src={program.coverImage} alt={program.title} fill className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--brand-yellow)]/10 px-3 py-1 text-xs uppercase tracking-wide text-[var(--brand-yellow)]">
              {program.category}
            </span>
            <ProgramFollowButton programId={program.id} programTitle={program.title} />
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--brand-yellow)] sm:text-5xl">
            {program.title}
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)]">{program.description}</p>
        </div>
        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-white/10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Episódios</h2>
          <ul className="mt-4 space-y-3">
            {(program.episodes ?? []).map((ep) => (
              <li key={ep.id}>
                <Link
                  href={`/episodios/${ep.id}`}
                  className="flex flex-col gap-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3 text-sm hover:border-[var(--brand-yellow)]/40 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{ep.title}</p>
                    <p className="mt-1 text-xs text-white/50">
                      {new Date(ep.publishedAt).toLocaleDateString("pt-PT")} · {ep.duration}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-white/45 sm:text-right">{ep.views.toLocaleString("pt-PT")} visualizações</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
