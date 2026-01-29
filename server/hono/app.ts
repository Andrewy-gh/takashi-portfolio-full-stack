import { Hono } from "hono";
import { cors } from "hono/cors";
import cloudinaryRoutes from "./routes/cloudinary";
import authRoutes from "./routes/auth";
import imagesRoutes from "./routes/images";

const app = new Hono();

const allowedOrigins = [
  "https://takashi-photos.fly.dev",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

const routes = app
  .get("/health", (c) => c.json({ ok: true }))
  .route("/api/auth", authRoutes)
  .route("/api/cloudinary", cloudinaryRoutes)
  .route("/api/images", imagesRoutes);

export type AppType = typeof routes;

export default app;
