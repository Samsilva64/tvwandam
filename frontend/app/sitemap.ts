import type { MetadataRoute } from "next";
import { fetchJson } from "@/lib/api";
import type { Post } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const posts = await fetchJson<Post[]>("/posts?take=200", { next: { revalidate: 3600 } });

  const staticRoutes = ["", "/programas", "/ao-vivo", "/noticias", "/artistas", "/parceiros"];
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.75,
  }));

  const newsEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${base}/noticias/${post.slug}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  return [...staticEntries, ...newsEntries];
}
