import { Hono } from "hono";
import { cors } from "hono/cors";
import cloudinaryRoutes from "./routes/cloudinary";
import authRoutes from "./routes/auth";
import imagesRoutes from "./routes/images";
import categoriesRoutes from "./routes/categories";
import dashboardRoutes from "./routes/dashboard";

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
  .route("/api/images", imagesRoutes)
  .route("/api/categories", categoriesRoutes)
  .route("/api/dashboard", dashboardRoutes);

const retired = (feature: string) => (c) =>
  c.json({ error: `${feature} endpoints are retired` }, 410);

app.all("/api/projects", retired("Projects"));
app.all("/api/projects/*", retired("Projects"));
app.all("/api/featured-images", retired("Featured images"));
app.all("/api/featured-images/*", retired("Featured images"));
app.all("/api/file-sync", retired("File sync"));
app.all("/api/file-sync/*", retired("File sync"));

export type AppType = typeof routes;

export default app;
