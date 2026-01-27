import { Hono } from "hono";
import cloudinaryRoutes from "./routes/cloudinary";

const app = new Hono();

const routes = app
  .get("/health", (c) => c.json({ ok: true }))
  .route("/api/cloudinary", cloudinaryRoutes);

export type AppType = typeof routes;

export default app;
