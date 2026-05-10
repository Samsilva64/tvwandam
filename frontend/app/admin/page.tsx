"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authFetch, authUpload, clearToken, getToken } from "@/lib/admin-api";
import type { LiveStream, Partner, Post, Program } from "@/lib/types";

type Tab = "programs" | "episodes" | "posts" | "live" | "partners" | "upload";

export default function AdminHomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("programs");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [live, setLive] = useState<LiveStream[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) router.replace("/admin/login");
  }, [router]);

  async function reload() {
    const [p, po, l, pa] = await Promise.all([
      authFetch("/programs"),
      authFetch("/posts"),
      authFetch("/live-streams"),
      authFetch("/partners"),
    ]);
    if (p.ok) setPrograms(await p.json());
    if (po.ok) setPosts(await po.json());
    if (l.ok) setLive(await l.json());
    if (pa.ok) setPartners(await pa.json());
  }

  useEffect(() => {
    if (!getToken()) return;
    const load = async () => {
      await reload();
    };
    void load();
  }, []);

  function logout() {
    clearToken();
    router.push("/admin/login");
  }

  async function onCreateProgram(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await authFetch("/programs", {
      method: "POST",
      body: JSON.stringify({
        title: String(fd.get("title")),
        description: String(fd.get("description")),
        coverImage: String(fd.get("coverImage")),
        category: String(fd.get("category")),
      }),
    });
    setMsg(res.ok ? "Programa criado." : "Erro ao criar programa");
    if (res.ok) {
      e.currentTarget.reset();
      void reload();
    }
  }

  async function onCreateEpisode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await authFetch("/episodes", {
      method: "POST",
      body: JSON.stringify({
        programId: String(fd.get("programId")),
        title: String(fd.get("title")),
        description: String(fd.get("description")),
        videoUrl: String(fd.get("videoUrl")),
        thumbnail: String(fd.get("thumbnail")),
        duration: String(fd.get("duration")),
        publishedAt: new Date(String(fd.get("publishedAt"))).toISOString(),
      }),
    });
    setMsg(res.ok ? "Episódio criado." : "Erro ao criar episódio");
    if (res.ok) {
      e.currentTarget.reset();
    }
  }

  async function onCreatePost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await authFetch("/posts", {
      method: "POST",
      body: JSON.stringify({
        title: String(fd.get("title")),
        content: String(fd.get("content")),
        image: fd.get("image") ? String(fd.get("image")) : null,
        category: String(fd.get("category")),
      }),
    });
    setMsg(res.ok ? "Notícia publicada." : "Erro ao publicar");
    if (res.ok) {
      e.currentTarget.reset();
      void reload();
    }
  }

  async function onCreateLive(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await authFetch("/live-streams", {
      method: "POST",
      body: JSON.stringify({
        title: String(fd.get("title")),
        description: fd.get("description") ? String(fd.get("description")) : null,
        status: String(fd.get("status")),
        embedUrl: String(fd.get("embedUrl")),
        scheduledAt: (() => {
          const v = fd.get("scheduledAt");
          if (!v || String(v).trim() === "") return null;
          return new Date(String(v)).toISOString();
        })(),
      }),
    });
    setMsg(res.ok ? "Live criada/atualizada na lista." : "Erro ao guardar live");
    if (res.ok) {
      e.currentTarget.reset();
      void reload();
    }
  }

  async function onCreatePartner(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await authFetch("/partners", {
      method: "POST",
      body: JSON.stringify({
        name: String(fd.get("name")),
        logo: String(fd.get("logo")),
        website: (() => {
          const w = fd.get("website");
          if (!w || String(w).trim() === "") return null;
          return String(w);
        })(),
        packageType: String(fd.get("packageType")),
      }),
    });
    setMsg(res.ok ? "Parceiro adicionado." : "Erro ao adicionar parceiro");
    if (res.ok) {
      e.currentTarget.reset();
      void reload();
    }
  }

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File)) return;
    const res = await authUpload(file);
    const data = (await res.json()) as { path?: string; error?: string };
    setMsg(res.ok && data.path ? `Upload OK: ${data.path}` : data.error ?? "Erro no upload");
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "programs", label: "Programas" },
    { id: "episodes", label: "Episódios" },
    { id: "posts", label: "Notícias" },
    { id: "live", label: "Live" },
    { id: "partners", label: "Parceiros" },
    { id: "upload", label: "Upload" },
  ];

  return (
    <div className="mx-auto min-w-0 max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <h1 className="break-words font-[family-name:var(--font-display)] text-2xl sm:text-4xl">Painel admin</h1>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto sm:justify-end">
          <Link
            href="/"
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 hover:text-white sm:flex-initial"
          >
            Site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/15 sm:flex-initial"
          >
            Sair
          </button>
        </div>
      </div>
      {msg && <p className="mt-4 text-sm text-[#f20707]">{msg}</p>}

      <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto overflow-y-hidden px-1 pb-2 sm:mt-8 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs ring-1 ${
              tab === t.id ? "bg-[#f20707]/25 ring-[#f20707]/45" : "bg-white/5 ring-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "programs" && (
        <div className="mt-8 grid gap-6 sm:gap-8 lg:grid-cols-2">
          <form onSubmit={onCreateProgram} className="space-y-3 rounded-2xl border border-white/10 p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">Novo programa</h2>
            <input name="title" required placeholder="Título" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <textarea name="description" required placeholder="Descrição" className="min-h-[90px] w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <input name="coverImage" required placeholder="URL da capa" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <input name="category" required placeholder="Categoria" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <button type="submit" className="rounded-md bg-[#f20707] px-4 py-2 text-sm font-semibold">
              Criar
            </button>
          </form>
          <div className="min-w-0 rounded-2xl border border-white/10 p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">Lista</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {programs.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-1 border-b border-white/5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
                >
                  <span className="min-w-0 break-words font-medium">{p.title}</span>
                  <span className="shrink-0 text-xs text-white/40 sm:text-sm">{p.category}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "episodes" && (
        <form onSubmit={onCreateEpisode} className="mt-8 space-y-3 rounded-2xl border border-white/10 p-4 sm:p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">Novo episódio</h2>
          <select name="programId" required className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2">
            <option value="">Programa…</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input name="title" required placeholder="Título" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
          <textarea name="description" required placeholder="Descrição" className="min-h-[80px] w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
          <input name="videoUrl" required placeholder="URL embed YouTube" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
          <input name="thumbnail" required placeholder="URL thumbnail" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
          <input name="duration" required placeholder="Duração (ex: 42 min)" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
          <input name="publishedAt" type="datetime-local" required className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
          <button type="submit" className="rounded-md bg-[#f20707] px-4 py-2 text-sm font-semibold">
            Publicar episódio
          </button>
        </form>
      )}

      {tab === "posts" && (
        <div className="mt-8 grid gap-6 sm:gap-8 lg:grid-cols-2">
          <form onSubmit={onCreatePost} className="space-y-3 rounded-2xl border border-white/10 p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">Nova notícia</h2>
            <input name="title" required placeholder="Título" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <textarea name="content" required placeholder="HTML / rich text" className="min-h-[120px] w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <input name="image" placeholder="URL imagem (opcional)" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <select name="category" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2">
              {["CULTURA", "MUSICA", "EVENTOS", "ENTREVISTAS"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-[#f20707] px-4 py-2 text-sm font-semibold">
              Publicar
            </button>
          </form>
          <div className="min-w-0 rounded-2xl border border-white/10 p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">Últimas</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {posts.map((p) => (
                <li key={p.id} className="border-b border-white/5 py-2">
                  <Link className="break-words text-[#f20707] hover:text-white" href={`/noticias/${p.slug}`}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "live" && (
        <div className="mt-8 grid gap-6 sm:gap-8 lg:grid-cols-2">
          <form onSubmit={onCreateLive} className="space-y-3 rounded-2xl border border-white/10 p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">Live stream</h2>
            <input name="title" required placeholder="Título" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <textarea name="description" placeholder="Descrição" className="min-h-[70px] w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <select name="status" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2">
              <option value="LIVE">LIVE</option>
              <option value="OFFLINE">OFFLINE</option>
              <option value="SCHEDULED">SCHEDULED</option>
            </select>
            <input name="embedUrl" required placeholder="URL embed (YouTube)" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <input name="scheduledAt" type="datetime-local" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <button type="submit" className="rounded-md bg-[#f20707] px-4 py-2 text-sm font-semibold">
              Guardar
            </button>
          </form>
          <div className="min-w-0 rounded-2xl border border-white/10 p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">Lista</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {live.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-col gap-1 border-b border-white/5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
                >
                  <span className="min-w-0 break-words">{l.title}</span>
                  <span className="shrink-0 text-xs text-white/45 sm:text-sm">{l.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "partners" && (
        <div className="mt-8 grid gap-6 sm:gap-8 lg:grid-cols-2">
          <form onSubmit={onCreatePartner} className="space-y-3 rounded-2xl border border-white/10 p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">Parceiro</h2>
            <input name="name" required placeholder="Nome" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <input name="logo" required placeholder="URL logo" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <input name="website" placeholder="Website" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <select name="packageType" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2">
              {["LOCAL", "BRONZE", "SILVER", "GOLD", "PLATINUM"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-[#f20707] px-4 py-2 text-sm font-semibold">
              Adicionar
            </button>
          </form>
          <div className="min-w-0 rounded-2xl border border-white/10 p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">Lista</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {partners.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-1 border-b border-white/5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
                >
                  <span className="min-w-0 break-words">{p.name}</span>
                  <span className="shrink-0 text-xs text-white/45 sm:text-sm">{p.packageType}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "upload" && (
        <form onSubmit={onUpload} className="mt-8 space-y-3 rounded-2xl border border-white/10 p-4 sm:p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">Upload de arquivos</h2>
          <p className="break-words text-sm text-white/55">
            Multipart para <code className="break-all rounded bg-white/10 px-1">/api/upload</code>. Use a URL retornada nos campos de imagem.
          </p>
          <input name="file" type="file" required className="w-full text-sm" />
          <button type="submit" className="rounded-md bg-[#f20707] px-4 py-2 text-sm font-semibold">
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}
