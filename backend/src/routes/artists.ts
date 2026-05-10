import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { routeParam } from "../util/params";

const router = Router();

const socialSchema = z.record(z.string(), z.string()).optional();

const createSchema = z.object({
  name: z.string().min(1),
  bio: z.string().min(1),
  image: z.string().min(1),
  socialLinks: z.union([socialSchema, z.object({}).passthrough()]).optional(),
});

const updateSchema = createSchema.partial();

router.get("/", async (_req, res) => {
  const artists = await prisma.artist.findMany({ orderBy: { name: "asc" } });
  res.json(artists);
});

router.get("/:id", async (req, res) => {
  const id = routeParam(req, "id");
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      episodes: {
        take: 12,
        orderBy: { publishedAt: "desc" },
        include: { program: { select: { id: true, title: true } } },
      },
    },
  });
  if (!artist) {
    res.status(404).json({ error: "Artista não encontrado" });
    return;
  }
  res.json(artist);
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  const { socialLinks: _ignored, ...rest } = parsed.data;
  const sl = (parsed.data.socialLinks ?? {}) as Prisma.JsonObject;
  const artist = await prisma.artist.create({
    data: {
      name: rest.name,
      bio: rest.bio,
      image: rest.image,
      socialLinks: sl,
    },
  });
  res.status(201).json(artist);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  try {
    const patch = { ...parsed.data };
    if (patch.socialLinks !== undefined) {
      patch.socialLinks = (patch.socialLinks ?? {}) as Prisma.JsonObject;
    }
    const artist = await prisma.artist.update({
      where: { id },
      data: patch as never,
    });
    res.json(artist);
  } catch {
    res.status(404).json({ error: "Artista não encontrado" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  try {
    await prisma.artist.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Artista não encontrado" });
  }
});

export default router;
