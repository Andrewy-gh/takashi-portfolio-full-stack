import { Hono } from "hono";
import cloudinaryRoutes from "./routes/cloudinary";
import authRoutes from "./routes/auth";

const app = new Hono();

const routes = app
  .get("/health", (c) => c.json({ ok: true }))
  .route("/api/auth", authRoutes)
  .route("/api/cloudinary", cloudinaryRoutes);

export type AppType = typeof routes;

export default app;
