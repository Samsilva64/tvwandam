import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth";
import programsRoutes from "./routes/programs";
import episodesRoutes from "./routes/episodes";
import postsRoutes from "./routes/posts";
import liveStreamsRoutes from "./routes/liveStreams";
import artistsRoutes from "./routes/artists";
import partnersRoutes from "./routes/partners";
import scheduleRoutes from "./routes/schedule";
import uploadRoutes from "./routes/upload";
import statsRoutes from "./routes/stats";
import youtubeAdminRoutes from "./routes/youtubeAdmin";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? true,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "TV WANDAM API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/programs", programsRoutes);
app.use("/api/episodes", episodesRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/live-streams", liveStreamsRoutes);
app.use("/api/artists", artistsRoutes);
app.use("/api/partners", partnersRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin/youtube", youtubeAdminRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Não encontrado" });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

app.listen(PORT, () => {
  console.log(`TV WANDAM API em http://localhost:${PORT}`);
});
