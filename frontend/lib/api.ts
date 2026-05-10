const DEFAULT_API = "http://localhost:4000";
const DEFAULT_TIMEOUT_MS = 900;

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API;
  }
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API;
}

export function apiUrl(path: string): string {
  const base = getApiBase().replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${p}`;
}

export async function fetchJson<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number }; timeoutMs?: number },
): Promise<T | null> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), init?.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const abortFromCaller = () => controller.abort();

  try {
    init?.signal?.addEventListener("abort", abortFromCaller, { once: true });
    const res = await fetch(apiUrl(path), {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    globalThis.clearTimeout(timeout);
    init?.signal?.removeEventListener("abort", abortFromCaller);
  }
}
