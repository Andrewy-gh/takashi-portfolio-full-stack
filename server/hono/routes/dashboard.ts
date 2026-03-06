import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { categories, images } from "../schema";
import { requireAdmin } from "../auth-utils";

const dashboardRoutes = new Hono().get("/", async (c) => {
  const auth = await requireAdmin(c.req.raw);
  if (!auth.ok) {
    return c.json({ error: auth.error }, auth.status);
  }

  const [{ imagesCount }] = await db
    .select({ imagesCount: sql<number>`count(*)` })
    .from(images);
  const [{ categoriesCount }] = await db
    .select({ categoriesCount: sql<number>`count(*)` })
    .from(categories);

  return c.json({
    images: { count: Number(imagesCount ?? 0) },
    categories: { count: Number(categoriesCount ?? 0) },
  });
});

export default dashboardRoutes;
