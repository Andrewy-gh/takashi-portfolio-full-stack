import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import cloudinaryRoutes from "./routes/cloudinary";
import authRoutes from "./routes/auth";
import imagesRoutes from "./routes/images";
import categoriesRoutes from "./routes/categories";
import dashboardRoutes from "./routes/dashboard";

const app = new Hono();

const defaultAllowedOrigins = [
  "https://takashi-photos.fly.dev",
  "http://localhost:3000",
  "http://localhost:5175",
  "http://localhost:5174",
];

const parseCorsOrigins = () => {
  const raw = process.env.CORS_ORIGINS ?? "";
  const parsed = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : defaultAllowedOrigins;
};

const allowedOrigins = parseCorsOrigins();
const dashboardDistRoot = path.resolve(process.cwd(), "dashboard-dist");
const dashboardIndexPath = path.join(dashboardDistRoot, "index.html");
const hasDashboardBuild = existsSync(dashboardIndexPath);
const dashboardIndexHtml = hasDashboardBuild
  ? readFileSync(dashboardIndexPath, "utf8")
  : "";
const serveDashboardStatic = serveStatic({ root: "./dashboard-dist" });
const isApiOrHealthPath = (pathname: string) =>
  pathname === "/api" ||
  pathname === "/health" ||
  pathname === "/health/" ||
  pathname.startsWith("/api/");

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
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

if (hasDashboardBuild) {
  app.use("*", async (c, next) => {
    const pathname = c.req.path;
    if (isApiOrHealthPath(pathname)) {
      await next();
      return;
    }

    return serveDashboardStatic(c, async () => {
      c.res = new Response(dashboardIndexHtml, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    });
  });
}

export type AppType = typeof routes;

export default app;
