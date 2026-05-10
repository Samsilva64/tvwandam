import { Router } from "express";
import { z } from "zod";
import { PartnerPackageType } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { routeParam } from "../util/params";

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  logo: z.string().min(1),
  website: z.string().url().optional().nullable().or(z.literal("")),
  packageType: z.nativeEnum(PartnerPackageType).optional(),
});

const updateSchema = createSchema.partial();

router.get("/", async (_req, res) => {
  const partners = await prisma.partner.findMany({ orderBy: { name: "asc" } });
  res.json(partners);
});

router.get("/:id", async (req, res) => {
  const id = routeParam(req, "id");
  const partner = await prisma.partner.findUnique({ where: { id } });
  if (!partner) {
    res.status(404).json({ error: "Parceiro não encontrado" });
    return;
  }
  res.json(partner);
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  const data = {
    ...parsed.data,
    website: parsed.data.website === "" ? null : parsed.data.website,
  };
  const partner = await prisma.partner.create({ data });
  res.status(201).json(partner);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  try {
    const data = { ...parsed.data };
    if (data.website === "") data.website = null;
    const partner = await prisma.partner.update({
      where: { id },
      data: data as never,
    });
    res.json(partner);
  } catch {
    res.status(404).json({ error: "Parceiro não encontrado" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  try {
    await prisma.partner.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Parceiro não encontrado" });
  }
});

export default router;
