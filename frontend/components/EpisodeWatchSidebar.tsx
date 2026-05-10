"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Episode } from "@/lib/types";

type Props = {
  anterior: Episode | null;
  proximo: Episode | null;
  aSeguir: Episode[];
};

const AUTOPLAY_KEY = "tvwandem_autoplay_next";

export function EpisodeWatchControls({ anterior, proximo }: Pick<Props, "anterior" | "proximo">) {
  const router = useRouter();
  const [autoplayNext, setAutoplayNext] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(AUTOPLAY_KEY);
    setAutoplayNext(saved === "1");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      if (isTyping) return;

      if (event.key === "ArrowLeft" && anterior) {
        event.preventDefault();
        router.push(buildEpisodeHref(anterior.id, autoplayNext));
      } else if (event.key === "ArrowRight" && proximo) {
        event.preventDefault();
        router.push(buildEpisodeHref(proximo.id, autoplayNext));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [anterior, proximo, autoplayNext, router]);

  const toggleAutoplay = () => {
    const next = !autoplayNext;
    setAutoplayNext(next);
    localStorage.setItem(AUTOPLAY_KEY, next ? "1" : "0");
  };

  const anteriorHref = useMemo(() => (anterior ? buildEpisodeHref(anterior.id, autoplayNext) : null), [anterior, autoplayNext]);
  const proximoHref = useMemo(() => (proximo ? buildEpisodeHref(proximo.id, autoplayNext) : null), [proximo, autoplayNext]);

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      {anteriorHref ? (
        <Link href={anteriorHref} className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/85 hover:border-[var(--brand-yellow)]/45">
          ← Anterior
        </Link>
      ) : (
        <span className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/35">← Anterior</span>
      )}
      {proximoHref ? (
        <Link href={proximoHref} className="rounded-md border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/85 hover:border-[var(--brand-yellow)]/45">
          Próximo →
        </Link>
      ) : (
        <span className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/35">Próximo →</span>
      )}
      <button
        type="button"
        onClick={toggleAutoplay}
        className={`rounded-md px-3 py-2 text-xs ring-1 ${
          autoplayNext ? "bg-[var(--brand-yellow)]/16 text-[var(--foreground)] ring-[var(--brand-yellow)]/45" : "bg-white/[0.03] text-white/70 ring-white/15"
        }`}
      >
        Autoplay próximo: {autoplayNext ? "ON" : "OFF"}
      </button>
    </div>
  );
}

export function EpisodeWatchSidebar({ aSeguir }: Pick<Props, "aSeguir">) {
  const [autoplayNext, setAutoplayNext] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(AUTOPLAY_KEY);
    setAutoplayNext(saved === "1");
  }, []);

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-white/10">
      <h2 className="font-[family-name:var(--font-display)] text-2xl">A seguir</h2>
      <ul className="mt-4 space-y-3">
        {aSeguir.map((ep) => (
          <li key={ep.id}>
            <Link
              href={buildEpisodeHref(ep.id, autoplayNext)}
              className="flex items-start gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3 hover:border-[var(--brand-yellow)]/40"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10">
                <Image src={ep.thumbnail} alt={ep.title} fill className="object-cover" sizes="112px" />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium">{ep.title}</p>
                <p className="mt-1 text-xs text-white/50">
                  {new Date(ep.publishedAt).toLocaleDateString("pt-PT")} · {ep.duration}
                </p>
              </div>
            </Link>
          </li>
        ))}
        {aSeguir.length === 0 && <li className="text-sm text-white/55">Sem próximos vídeos nesta playlist.</li>}
      </ul>
    </aside>
  );
}

function buildEpisodeHref(id: string, autoplayNext: boolean) {
  return autoplayNext ? `/episodios/${id}?autoplay=1` : `/episodios/${id}`;
}
