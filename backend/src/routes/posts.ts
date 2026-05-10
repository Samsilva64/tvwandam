import { Router } from "express";
import { z } from "zod";
import { PostCategory } from "@prisma/client";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import { routeParam } from "../util/params";

const router = Router();

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  image: z.string().optional().nullable(),
  category: z.nativeEnum(PostCategory),
  slug: z.string().min(1).optional(),
});

const updateSchema = createSchema.partial();

router.get("/", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const take = Math.min(Number(req.query.take) || 50, 100);
  const where =
    category && Object.values(PostCategory).includes(category as PostCategory)
      ? { category: category as PostCategory }
      : {};
  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
  });
  res.json(posts);
});

router.get("/slug/:slug", async (req, res) => {
  const slug = routeParam(req, "slug");
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    res.status(404).json({ error: "Notícia não encontrada" });
    return;
  }
  res.json(post);
});

router.get("/:id", async (req, res) => {
  const id = routeParam(req, "id");
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    res.status(404).json({ error: "Notícia não encontrada" });
    return;
  }
  res.json(post);
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  let slug = parsed.data.slug?.trim() || slugify(parsed.data.title);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;
  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      image: parsed.data.image ?? null,
      category: parsed.data.category,
      slug,
    },
  });
  res.status(201).json(post);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }
  try {
    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.title && !parsed.data.slug) {
      data.slug = slugify(parsed.data.title);
    }
    const post = await prisma.post.update({
      where: { id },
      data: data as never,
    });
    res.json(post);
  } catch {
    res.status(404).json({ error: "Notícia não encontrada" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = routeParam(req, "id");
  try {
    await prisma.post.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Notícia não encontrada" });
  }
});

export default router;
