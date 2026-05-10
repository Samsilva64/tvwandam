"use client";

import { useEffect, useRef } from "react";
import { apiUrl } from "@/lib/api";

type Props = { episodeId: string };

export function RegisterView({ episodeId }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch(apiUrl(`/episodes/${episodeId}/view`), { method: "POST" }).catch(() => undefined);
  }, [episodeId]);

  return null;
}
