import { Router } from "express";

const router = Router();

router.get("/audience", (_req, res) => {
  const base = 12000 + Math.floor(Math.random() * 8000);
  res.json({
    liveViewers: base,
    trend: Math.random() > 0.5 ? "up" : "down",
    updatedAt: new Date().toISOString(),
  });
});

export default router;
