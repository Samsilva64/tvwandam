import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { routeParam } from "../util/params";

const router = Router();

const youtubeCategories = ["YouTube", "Shorts", "Podcasts", "Playlists", "Eventos"] as const;

const listQuerySchema = z.object({
  programId: z.string().min(1).optional(),
  take: z.coerce.number().int().positive().max(100).optional(),
  sort: z.enum(["recent", "oldest", "popular"]).optional(),
  youtubeOnly: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => value === true || value === "true"),
});

const createSchema = z.object({
  programId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  videoUrl: z.string().min(1),
  thumbnail: z.string().min(1),
  duration: z.string().min(1),
  publishedAt: z.coerce.date(),
  artistIds: z.array(z.string()).optional(),
});

const updateSchema = createSchema.partial();
const unlockSyncSchema = z.object({
  ids: z.array(z.string().min(1)).optional(),
  programId: z.string().min(1).optional(),
  youtubeOnly: z.boolean().optional().default(true),
});
const watchContextSchema = z.object({
  programId: z.string().min(1).optional(),
  upNextTake: z.coerce.number().int().positive().max(20).optional().default(10),
});

router.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Query inválida", details: parsed.error.flatten() });
    return;
  }

  const { programId, sort = "recent", youtubeOnly = false } = parsed.data;
  const take = parsed.data.take ?? 24;

  const orderBy =
    sort === "popular"
      ? [{ views: "desc" as const }, { publishedAt: "desc" as const }]
      : [{ publishedAt: sort === "oldest" ? ("asc" as const) : ("desc" as const) }];

  const episodes = await prisma.episode.findMany({
    where: {
      ...(programId ? { programId } : {}),
      ...(youtubeOnly ? { program: { category: { in: [...youtubeCategories] } } } : {}),
    },
    orderBy,
    take,
    include: { program: { select: { id: true, title: true, category: true } } },
  });
  res.json(episodes);
});

router.post("/unlock-sync", requireAuth, async (req, res) => {
  const parsed = unlockSyncSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }

  const { ids, programId, youtubeOnly } = parsed.data;
  const where = ids?.length
    ? { id: { in: ids } }
    : {
      ...(programId ? { programId } : {}),
      ...(youtubeOnly ? { program: { category: { in: [...youtubeCategories] } } } : {}),
      isManuallyEdited: true,
    };

  const result = await prisma.episode.updateMany({
    where,
    data: { isManuallyEdited: false },
  });

  res.json({ updated: result.count, message: "Episódios desbloqueados para sincronização." });
});

router.get("/portfolio", async (req, res) => {
  const take = Math.min(Number(req.query.take) || 50, 100);
  const where = { program: { category: { in: [...youtubeCategories] } } };

  const [maisRecentes, maisAntigos, maisPopulares] = await Promise.all([
    prisma.episode.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take,
      include: { program: { select: { id: true, title: true, category: true } } },
    }),
    prisma.episode.findMany({
      where,
      orderBy: { publishedAt: "asc" },
      take,
      include: { program: { select: { id: true, title: true, category: true } } },
    }),
    prisma.episode.findMany({
      where,
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      take,
      include: { program: { select: { id: true, title: true, category: true } } },
    }),
  ]);

  res.json({ maisRecentes, maisAntigos, maisPopulares });
});

router.get("/:id/watch-context", async (req, res) => {
  const id = routeParam(req, "id");
  const parsed = watchContextSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Query inválida", details: parsed.error.flatten() });
    return;
  }

  const current = await prisma.episode.findUnique({
    where: { id },
    include: { program: { select: { id: true, title: true, category: true } } },
  });
  if (!current) {
    res.status(404).json({ error: "Episódio não encontrado" });
    return;
  }

  const contextProgramId = parsed.data.programId ?? current.programId;

  const [anterior, proximo, aSeguir] = await Promise.all([
    prisma.episode.findFirst({
      where: {
        programId: contextProgramId,
        OR: [
          { publishedAt: { gt: current.publishedAt } },
          { publishedAt: current.publishedAt, id: { gt: current.id } },
        ],
      },
      orderBy: [{ publishedAt: "asc" }, { id: "asc" }],
      include: { program: { select: { id: true, title: true, category: true } } },
    }),
    prisma.episode.findFirst({
      where: {
        programId: contextProgramId,
        OR: [
          { publishedAt: { lt: current.publishedAt } },
          { publishedAt: current.publishedAt, id: { lt: current.id } },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      include: { program: { select: { id: true, title: true, category: true } } },
    }),
    prisma.episode.findMany({
      where: {
        programId: contextProgramId,
        id: { not: current.id },
      },
      orderBy: [{ publishedAt: "desc" }, { views: "desc" }],
      take: parsed.data.upNextTake,
      include: { program: { select: { id: true, title: true, category: true } } },
    }),
  ]);

  res.json({
    atual: current,
    anterior,
    proximo,
    aSeguir,
  });
});

router.get("/:id", async (req, res) => {
  const id = routeParam(req, "id");
  const episode = await prisma.episode.findUnique({
    where: { id },
    include: {
      program: true,
      artists: true,
    },
  });
  if (!episode) {
    res.status(404).json({ error: "Episódio não encontrado" });
    return;
  }
  res.json(episode);
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  const { artistIds, ...data } = parsed.data;
  const episode = await prisma.episode.create({
    data: {
      ...data,
      isManuallyEdited: true,
      ...(artistIds?.length
        ? { artists: { connect: artistIds.map((id) => ({ id })) } }
        : {}),
    },
    include: { program: true, artists: true },
  });
  res.status(201).json(episode);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  const { artistIds, ...rest } = parsed.data;
  try {
    const episode = await prisma.episode.update({
      where: { id },
      data: {
        ...rest,
        isManuallyEdited: true,
        ...(artistIds !== undefined
          ? { artists: { set: artistIds.map((id) => ({ id })) } }
          : {}),
      },
      include: { program: true, artists: true },
    });
    res.json(episode);
  } catch {
    res.status(404).json({ error: "Episódio não encontrado" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  try {
    await prisma.episode.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Episódio não encontrado" });
  }
});

router.post("/:id/view", async (req, res) => {
  const id = routeParam(req, "id");
  try {
    const episode = await prisma.episode.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { id: true, views: true },
    });
    res.json(episode);
  } catch {
    res.status(404).json({ error: "Episódio não encontrado" });
  }
});

export default router;
