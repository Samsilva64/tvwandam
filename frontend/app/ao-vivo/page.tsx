import Link from "next/link";
import { fetchJson } from "@/lib/api";
import type { LiveStream } from "@/lib/types";
import { VideoEmbed } from "@/components/VideoEmbed";
import { Countdown } from "@/components/Countdown";

export const metadata = {
  title: "Ao vivo",
  description: "Transmissões, estreias e destaques da TV WANDAM.",
};

export default async function AoVivoPage() {
  const [streams, hero] = await Promise.all([
    fetchJson<LiveStream[]>("/live-streams", { next: { revalidate: 15 } }),
    fetchJson<LiveStream>("/live-streams/status/hero", { next: { revalidate: 10 } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--brand-yellow)] sm:text-5xl">AO VIVO</h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Diretos, estreias e videos recentes para acompanhar a TV Wandam onde estiveres.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-[var(--brand-yellow)] hover:text-[var(--foreground)]"
        >
          ← Voltar à home
        </Link>
      </div>

      {hero && (
        <div className="mt-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                hero.status === "LIVE"
                  ? "bg-[var(--brand-red)]/20 text-[var(--brand-red)] ring-1 ring-[var(--brand-red)]/40"
                  : hero.status === "SCHEDULED"
                    ? "bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)] ring-1 ring-[var(--brand-yellow)]/35"
                    : "bg-[rgba(255,255,255,0.08)] text-[var(--foreground)]/70 ring-1 ring-[rgba(255,255,255,0.12)]"
              }`}
            >
              {hero.status}
            </span>
            {hero.status === "SCHEDULED" && hero.scheduledAt && <Countdown targetIso={hero.scheduledAt} />}
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl">{hero.title}</h2>
          {hero.description && <p className="text-white/70">{hero.description}</p>}
          <VideoEmbed title={hero.title} embedUrl={hero.embedUrl} />
        </div>
      )}

      <div className="mt-10">
        <h3 className="font-[family-name:var(--font-display)] text-2xl">Mais transmissões</h3>
        <ul className="mt-4 space-y-3 text-sm text-white/75">
          {(streams ?? []).map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <span className="font-medium text-white">{s.title}</span>
              <span className="text-xs text-white/50">{s.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
