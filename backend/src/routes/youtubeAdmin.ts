import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { syncYoutubeChannel } from "../services/youtubeSync";

const router = Router();

const syncSchema = z.object({
  refreshNonManual: z.boolean().optional().default(true),
});

router.post("/sync", requireAuth, async (req, res) => {
  const parsed = syncSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() });
    return;
  }

  const result = await syncYoutubeChannel({
    refreshNonManual: parsed.data.refreshNonManual,
  });

  res.json({
    message: "Sincronização do YouTube concluída.",
    ...result,
  });
});

export default router;
