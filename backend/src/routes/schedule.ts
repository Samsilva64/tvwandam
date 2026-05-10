import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { routeParam } from "../util/params";

const router = Router();

const createSchema = z.object({
  date: z.coerce.date(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  programId: z.string().min(1),
});

const updateSchema = createSchema.partial();

router.get("/day", async (req, res) => {
  const raw = typeof req.query.date === "string" ? req.query.date : undefined;
  const day = raw ? new Date(raw + "T12:00:00.000Z") : new Date();
  const start = new Date(day);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setUTCHours(23, 59, 59, 999);

  const items = await prisma.scheduleItem.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    orderBy: { startTime: "asc" },
    include: { program: true },
  });
  res.json(items);
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  const item = await prisma.scheduleItem.create({
    data: parsed.data,
    include: { program: true },
  });
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
    const item = await prisma.scheduleItem.update({
      where: { id },
      data: parsed.data,
      include: { program: true },
    });
    res.json(item);
  } catch {
    res.status(404).json({ error: "Slot não encontrado" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  try {
    await prisma.scheduleItem.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Slot não encontrado" });
  }
});

export default router;
