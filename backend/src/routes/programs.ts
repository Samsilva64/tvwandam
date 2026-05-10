import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { routeParam } from "../util/params";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  coverImage: z.string().min(1),
  category: z.string().min(1),
});

const updateSchema = createSchema.partial();
const unlockSyncSchema = z.object({
  ids: z.array(z.string().min(1)).optional(),
  youtubeOnly: z.boolean().optional().default(true),
});

router.get("/", async (_req, res) => {
  const programs = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { episodes: true } } },
  });
  const fixedYoutubeOrder: Record<string, number> = {
    "youtube-videos-all": 0,
    "youtube-shorts": 1,
    "youtube-eventos": 2,
    "youtube-podcasts": 3,
  };

  const sorted = [...programs].sort((a, b) => {
    const aPriority = fixedYoutubeOrder[a.id] ?? Number.MAX_SAFE_INTEGER;
    const bPriority = fixedYoutubeOrder[b.id] ?? Number.MAX_SAFE_INTEGER;
    if (aPriority !== bPriority) return aPriority - bPriority;

    const aIsPlaylist = a.id.startsWith("youtube-playlist-");
    const bIsPlaylist = b.id.startsWith("youtube-playlist-");
    if (aIsPlaylist !== bIsPlaylist) return aIsPlaylist ? -1 : 1;

    return a.title.localeCompare(b.title, "pt");
  });

  res.json(sorted);
});

router.post("/unlock-sync", requireAuth, async (req, res) => {
  const parsed = unlockSyncSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }

  const where = parsed.data.ids?.length
    ? { id: { in: parsed.data.ids } }
    : {
      ...(parsed.data.youtubeOnly
        ? { id: { startsWith: "youtube-" } }
        : {}),
      isManuallyEdited: true,
    };

  const result = await prisma.program.updateMany({
    where,
    data: { isManuallyEdited: false },
  });

  res.json({ updated: result.count, message: "Programas desbloqueados para sincronização." });
});

router.get("/:id", async (req, res) => {
  const id = routeParam(req, "id");
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      episodes: { orderBy: { publishedAt: "desc" } },
    },
  });
  if (!program) {
    res.status(404).json({ error: "Programa não encontrado" });
    return;
  }
  res.json(program);
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  const program = await prisma.program.create({
    data: { ...parsed.data, isManuallyEdited: true },
  });
  res.status(201).json(program);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  try {
    const program = await prisma.program.update({
      where: { id },
      data: { ...parsed.data, isManuallyEdited: true },
    });
    res.json(program);
  } catch {
    res.status(404).json({ error: "Programa não encontrado" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  try {
    await prisma.program.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Programa não encontrado" });
  }
});

export default router;
