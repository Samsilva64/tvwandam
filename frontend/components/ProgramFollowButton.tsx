"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const KEY = "tvwandem_follow_programs";

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

type Props = { programId: string; programTitle: string };

export function ProgramFollowButton({ programId, programTitle }: Props) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const updateOn = async () => {
      setOn(readIds().includes(programId));
    };
    void updateOn();
  }, [programId]);

  function toggle() {
    const ids = new Set(readIds());
    if (ids.has(programId)) {
      ids.delete(programId);
      setOn(false);
    } else {
      ids.add(programId);
      setOn(true);
      try {
        localStorage.setItem(
          "tvwandem_last_follow",
          JSON.stringify({ title: programTitle, at: Date.now() }),
        );
      } catch {
        void 0;
      }
    }
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={toggle}
      className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
        on
          ? "bg-[#f20707] text-white ring-[#f20707]"
          : "bg-white/5 text-white/90 ring-white/15 hover:bg-white/10"
      }`}
    >
      {on ? "A seguir" : "Seguir programa"}
    </motion.button>
  );
}
