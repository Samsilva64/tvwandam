"use client";

import { useEffect, useState } from "react";

type Props = { targetIso: string };

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function Countdown({ targetIso }: Props) {
  const target = new Date(targetIso).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90">
      <span className="text-white/60">Próximo evento em</span>
      <span className="font-mono text-[#f20707]">
        {d > 0 ? `${d}d ` : ""}
        {pad(h)}:{pad(m)}:{pad(sec)}
      </span>
    </div>
  );
}
