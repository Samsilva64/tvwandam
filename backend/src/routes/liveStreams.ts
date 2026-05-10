import { Router } from "express";
import { z } from "zod";
import { LiveStreamStatus } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { routeParam } from "../util/params";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(LiveStreamStatus).optional(),
  embedUrl: z.string().min(1),
  scheduledAt: z.coerce.date().optional().nullable(),
});

const updateSchema = createSchema.partial();

router.get("/", async (_req, res) => {
  const items = await prisma.liveStream.findMany({ orderBy: { updatedAt: "desc" } });
  res.json(items);
});

router.get("/status/hero", async (_req, res) => {
  const live = await prisma.liveStream.findFirst({
    where: { status: "LIVE" },
    orderBy: { updatedAt: "desc" },
  });
  if (live) {
    res.json(live);
    return;
  }
  const next = await prisma.liveStream.findFirst({
    where: { status: "SCHEDULED" },
    orderBy: { scheduledAt: "asc" },
  });
  res.json(next);
});

router.get("/:id", async (req, res) => {
  const id = routeParam(req, "id");
  const item = await prisma.liveStream.findUnique({ where: { id } });
  if (!item) {
    res.status(404).json({ error: "Transmissão não encontrada" });
    return;
  }
  res.json(item);
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  const item = await prisma.liveStream.create({ data: parsed.data });
  res.status(201).json(item);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  try {
    const item = await prisma.liveStream.update({
      where: { id },
      data: parsed.data,
    });
    res.json(item);
  } catch {
    res.status(404).json({ error: "Transmissão não encontrada" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  try {
    await prisma.liveStream.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Transmissão não encontrada" });
  }
});

export default router;
