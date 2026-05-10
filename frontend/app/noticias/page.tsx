import Image from "next/image";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import type { Post } from "@/lib/types";

export const metadata = {
  title: "Notícias",
  description: "Cultura, música, eventos e entrevistas — área editorial otimizada para SEO da TV WANDAM.",
};

const categories = ["CULTURA", "MUSICA", "EVENTOS", "ENTREVISTAS"] as const;

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const sp = await searchParams;
  const cat = sp.categoria?.toUpperCase();
  const filter =
    cat && categories.includes(cat as (typeof categories)[number]) ? `?category=${cat}` : "";
  const posts = await fetchJson<Post[]>(`/posts${filter}`, { next: { revalidate: 30 } });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--brand-yellow)] sm:text-5xl">Notícias</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Música, campanhas, eventos e assuntos que mexem com a nossa comunidade.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/noticias"
          className={`rounded-full px-4 py-2 text-xs ring-1 ${!cat ? "bg-[var(--brand-yellow)]/20 ring-[var(--brand-yellow)]/40" : "bg-[rgba(255,255,255,0.05)] ring-[rgba(255,255,255,0.1)]"}`}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/noticias?categoria=${c}`}
            className={`rounded-full px-4 py-2 text-xs ring-1 ${cat === c ? "bg-[var(--brand-yellow)]/20 ring-[var(--brand-yellow)]/40" : "bg-[rgba(255,255,255,0.05)] ring-[rgba(255,255,255,0.1)]"}`}
          >
            {c.charAt(0) + c.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {(posts ?? []).map((post) => (
          <Link
            key={post.id}
            href={`/noticias/${post.slug}`}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ring-1 ring-white/10 transition hover:border-[#f20707]/35"
          >
            <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
              {post.image && (
                <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[200px]">
                  <Image src={post.image} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 220px" />
                </div>
              )}
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#f20707]">{post.category}</p>
                <h2 className="mt-2 text-xl font-semibold group-hover:text-white">{post.title}</h2>
                <p className="mt-3 text-sm text-white/55">
                  {new Date(post.createdAt).toLocaleDateString("pt-PT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
