import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJson } from "@/lib/api";
import type { Post } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await fetchJson<Post>(`/posts/slug/${slug}`, { next: { revalidate: 60 } });
  if (!post) return { title: "Notícia" };
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    title: post.title,
    description: post.content.replace(/<[^>]+>/g, "").slice(0, 160),
    alternates: { canonical: `${base}/noticias/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      publishedTime: post.createdAt,
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchJson<Post>(`/posts/slug/${slug}`, { next: { revalidate: 60 } });
  if (!post) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    datePublished: post.createdAt,
    image: post.image ? [post.image] : undefined,
    author: { "@type": "Organization", name: "TV WANDAM" },
    mainEntityOfPage: `${base}/noticias/${post.slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="text-sm text-white/55">
        <Link href="/noticias" className="hover:text-white">
          Notícias
        </Link>
        <span className="mx-2 text-white/35">/</span>
        <span className="text-white/70">{post.category}</span>
      </div>
      <h1 className="mt-4 break-words font-[family-name:var(--font-display)] text-3xl leading-tight tracking-tight sm:text-4xl sm:leading-none lg:text-5xl">
        {post.title}
      </h1>
      <p className="mt-4 text-sm text-white/50">
        {new Date(post.createdAt).toLocaleString("pt-PT")}
      </p>
      {post.image && (
        <div className="relative mt-8 aspect-[21/9] overflow-hidden rounded-2xl ring-1 ring-white/10">
          <Image src={post.image} alt="" fill className="object-cover" priority sizes="100vw" />
        </div>
      )}
      <div
        className="mt-10 max-w-full space-y-4 break-words text-base leading-relaxed text-white/85 [overflow-wrap:anywhere] [&_a]:text-[var(--brand-yellow)] [&_a]:underline [&_em]:text-white/90 [&_h2]:mt-8 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:font-[family-name:var(--font-display)] [&_h3]:text-xl [&_img]:h-auto [&_img]:max-w-full [&_p]:text-white/80 [&_strong]:text-white"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
