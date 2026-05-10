import Image from "next/image";
import Link from "next/link";
import { fetchJson } from "@/lib/api";
import type { AudienceStats, Episode, LiveStream, Partner, Post, Program, ScheduleItem } from "@/lib/types";
import { VideoEmbed } from "@/components/VideoEmbed";
import { Countdown } from "@/components/Countdown";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default async function HomePage() {
  const day = todayIsoDate();
  const [programs, episodes, liveHero, schedule, posts, partners, audience] = await Promise.all([
    fetchJson<Program[]>("/programs", { next: { revalidate: 30 } }),
    fetchJson<Episode[]>("/episodes?take=12", { next: { revalidate: 30 } }),
    fetchJson<LiveStream>("/live-streams/status/hero", { next: { revalidate: 10 } }),
    fetchJson<ScheduleItem[]>(`/schedule/day?date=${day}`, { next: { revalidate: 60 } }),
    fetchJson<Post[]>("/posts?take=4", { next: { revalidate: 30 } }),
    fetchJson<Partner[]>("/partners", { next: { revalidate: 120 } }),
    fetchJson<AudienceStats>("/stats/audience", { next: { revalidate: 15 } }),
  ]);

  const featuredProgram = programs?.[0];
  const heroEpisode = episodes?.[0];
  const featuredPrograms = programs?.slice(0, 6) ?? [];

  return (
    <div className="pb-12">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {heroEpisode?.thumbnail ? (
            <Image
              src={heroEpisode.thumbnail}
              alt=""
              fill
              priority
              className="object-cover opacity-35 blur-[1px]"
              sizes="100vw"
            />
          ) : featuredProgram?.coverImage ? (
            <Image
              src={featuredProgram.coverImage}
              alt=""
              fill
              priority
              className="object-cover opacity-35"
              sizes="100vw"
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,#050505_0%,#210404_32%,#211904_55%,#041406_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[rgba(3,3,3,0.86)] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)] via-transparent to-[rgba(3,3,3,0.42)]" />
        </div>

        <div className="relative flex w-full flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-start lg:justify-start lg:gap-12">
          <div className="flex-1 lg:max-w-none text-left">
            <Image
              src="/brand/tvwandam-logo.png"
              alt="TV Wandam"
              width={761}
              height={617}
              priority
              className="mb-5 h-16 w-auto object-contain drop-shadow-[0_18px_42px_rgba(0,0,0,0.55)] sm:h-20 lg:h-24"
              sizes="(max-width: 640px) 120px, (max-width: 768px) 160px, 250px"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--brand-yellow)] sm:text-sm">Emissora digital</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight sm:text-4xl lg:text-5xl">
              TV WANDAM
            </h1>
            <p className="mt-4 max-w-xl text-sm text-[var(--muted)] sm:text-base lg:text-lg">
              Cultura, música, informação útil e histórias da Guiné-Bissau para a comunidade no país e na diáspora.
            </p>
            {heroEpisode && (
              <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                <Link
                  href={`/episodios/${heroEpisode.id}`}
                  className="inline-flex items-center justify-center rounded-md bg-[var(--brand-red)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-lg shadow-[rgba(242,7,7,0.25)] hover:bg-[#c90606] sm:px-5 sm:py-3"
                >
                  Ver episódio em destaque
                </Link>
                <Link
                  href="/programas"
                  className="inline-flex items-center justify-center rounded-md border border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.32)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)]/90 hover:border-[var(--brand-red)]/40 hover:text-[var(--foreground)] sm:px-5 sm:py-3"
                >
                  Explorar programas
                </Link>
              </div>
            )}
          </div>

          <div className="w-full flex-1 lg:max-w-md space-y-3 text-left">
            {audience && (
              <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-black/45 px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3">
                <span className="text-xs text-white/65 sm:text-sm">Comunidade ligada agora</span>
                <span className="font-mono text-xs text-[#f20707] sm:text-sm">
                  {audience.liveViewers.toLocaleString("pt-PT")} espectadores
                </span>
              </div>
            )}
            {heroEpisode && (
              <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    title={heroEpisode.title}
                    src={heroEpisode.videoUrl}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <div className="border-t border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white/75 sm:px-4 sm:py-3">
                  <span className="text-white text-xs sm:text-sm">Destaque:</span> <span className="text-xs sm:text-sm">{heroEpisode.title}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="w-full mt-4 px-4 sm:px-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-4 sm:p-6 md:flex-row md:items-center md:justify-start">
          <div className="flex-1">
            <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">Ao vivo agora</h2>
            <p className="mt-1 text-xs text-white/60 sm:text-sm">
              Acompanhe os destaques, diretos e estreias da TV Wandam.
            </p>
          </div>
          {liveHero ? (
            <div className="flex flex-col items-start gap-3 md:items-end">
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide sm:px-3 sm:py-1 ${
                  liveHero.status === "LIVE"
                    ? "bg-[var(--brand-red)]/25 text-[var(--brand-red)] ring-1 ring-[var(--brand-red)]/40"
                    : liveHero.status === "SCHEDULED"
                      ? "bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)] ring-1 ring-[var(--brand-yellow)]/35"
                      : "bg-[rgba(255,255,255,0.08)] text-[var(--foreground)]/70 ring-1 ring-[rgba(255,255,255,0.12)]"
                }`}
              >
                {liveHero.status === "LIVE" ? "NO AR" : liveHero.status === "SCHEDULED" ? "AGENDADO" : "OFFLINE"}
              </span>
              {liveHero.status === "SCHEDULED" && liveHero.scheduledAt && (
                <Countdown targetIso={liveHero.scheduledAt} />
              )}
              <Link href="/ao-vivo" className="text-xs font-medium text-[var(--brand-yellow)] hover:text-[var(--foreground)] sm:text-sm">
                Abrir página ao vivo →
              </Link>
            </div>
          ) : (
            <p className="text-xs text-white/55 sm:text-sm">Voltamos já com novos conteúdos.</p>
          )}
        </div>
        {liveHero && (
          <div className="mt-5">
            <VideoEmbed title={liveHero.title} embedUrl={liveHero.embedUrl} />
          </div>
        )}
      </section>

      <section className="w-full mt-14 px-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-start gap-x-4 gap-y-2">
          <h2 className="min-w-0 shrink font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">
            Últimos episódios
          </h2>
          <Link href="/programas" className="inline-flex min-h-9 items-center text-sm text-[#f20707] hover:text-white">
            Ver tudo
          </Link>
        </div>
        <div className="row-scroll mt-6 flex gap-3 overflow-x-auto pb-2 sm:gap-4">
          {(episodes ?? []).map((ep) => (
            <Link
              key={ep.id}
              href={`/episodios/${ep.id}`}
              className="group relative w-[min(240px,85vw)] shrink-0 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition hover:ring-[#f20707]/40 sm:w-[280px]"
            >
              <div className="relative aspect-video">
                <Image
                  src={ep.thumbnail}
                  alt={ep.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 85vw, 280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <p className="text-xs text-white/70">{ep.program?.title ?? "Programa"}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold sm:text-sm">{ep.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="w-full mt-14 px-4 sm:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">Programação do dia</h2>
        <p className="mt-2 text-sm text-white/55">{day}</p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(schedule ?? []).length === 0 ? (
            <p className="text-sm text-white/55">A grelha de hoje será anunciada em breve.</p>
          ) : (
            (schedule ?? []).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 sm:p-4"
              >
                <div>
                  <p className="text-xs text-white/55">
                    {s.startTime} — {s.endTime}
                  </p>
                  <p className="mt-1 text-sm font-medium">{s.program.title}</p>
                  <p className="mt-1 text-xs text-white/50">{s.program.category}</p>
                </div>
                <Link href={`/programas/${s.programId}`} className="shrink-0 text-xs text-[#f20707] hover:text-white sm:text-sm">
                  Ver
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="w-full mt-14 px-4 sm:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">Programas em destaque</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredPrograms.map((p) => (
            <Link
              key={p.id}
              href={`/programas/${p.id}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ring-1 ring-white/10 transition hover:border-[#f20707]/35"
            >
              <div className="relative aspect-[16/10]">
                <Image src={p.coverImage} alt={p.title} fill className="object-cover" sizes="(max-width:640px) 100vw, (max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                  <p className="text-xs uppercase tracking-wider text-[#f20707]">{p.category}</p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-lg leading-none sm:text-2xl">{p.title}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-white/65 sm:text-sm">{p.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="w-full mt-14 px-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-start gap-x-4 gap-y-2">
          <h2 className="min-w-0 shrink font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">Notícias</h2>
          <Link href="/noticias" className="inline-flex min-h-9 items-center text-sm text-[#f20707] hover:text-white">
            Ver todas
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {(posts ?? []).map((post) => (
            <Link
              key={post.id}
              href={`/noticias/${post.slug}`}
              className="group flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 ring-1 ring-white/10 transition hover:border-[#f20707]/35 sm:p-4"
            >
              {post.image && (
                <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-lg sm:block lg:h-28">
                  <Image src={post.image} alt="" fill className="object-cover" sizes="128px, (min-width: 1024px) 112px" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#f20707]">{post.category}</p>
                <p className="mt-2 line-clamp-2 text-base font-semibold group-hover:text-white sm:text-lg">{post.title}</p>
                <p className="mt-2 text-xs text-white/45">
                  {new Date(post.createdAt).toLocaleDateString("pt-PT")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="w-full mt-14 px-4 sm:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">Parceiros &amp; publicidade</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Espaço para marcas, instituições e iniciativas que querem falar com a Guiné-Bissau de forma próxima.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {(partners ?? []).map((p) => (
            <a
              key={p.id}
              href={p.website ?? "#"}
              target={p.website ? "_blank" : undefined}
              rel={p.website ? "noopener noreferrer" : undefined}
              className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/30 p-3 text-center ring-1 ring-white/10 transition hover:border-[#f20707]/35 sm:p-4"
            >
              <Image src={p.logo} alt={p.name} width={140} height={80} className="h-10 w-auto max-w-full object-contain opacity-90 sm:h-12" />
              <span className="mt-2 text-xs text-white/70">{p.name}</span>
              <span className="mt-1 text-[10px] text-white/40">{p.packageType}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
