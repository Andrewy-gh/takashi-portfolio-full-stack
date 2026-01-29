import { Hono } from "hono";
import { asc, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "../db";
import { images } from "../schema";

const parseNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getSortColumn = (sort?: string) => {
  switch (sort) {
    case "name":
    case "title":
      return images.title;
    case "updatedAt":
    case "updated_at":
      return images.updatedAt;
    case "createdAt":
    case "created_at":
    default:
      return images.createdAt;
  }
};

const imagesRoutes = new Hono()
  .get("/", async (c) => {
    const query = c.req.query();
    const page = Math.max(parseNumber(query.page, 1), 1);
    const pageSize = Math.min(
      Math.max(parseNumber(query.pageSize, 10), 1),
      100
    );
    const search = query.search?.trim();
    const publicId = query.publicId?.trim();
    const sortColumn = getSortColumn(query.sort);
    const direction = query.direction === "asc" ? asc : desc;

    const whereClause = publicId
      ? eq(images.publicId, publicId)
      : search
        ? ilike(images.title, `%${search}%`)
        : undefined;

    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(images)
      .where(whereClause);

    const rows = await db
      .select()
      .from(images)
      .where(whereClause)
      .orderBy(direction(sortColumn))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const payload = rows.map((image) => ({
      ...image,
      cloudinaryId: image.publicId,
    }));

    return c.json({
      page,
      pageSize,
      totalImages: count ?? 0,
      images: payload,
    });
  })
  .post("/", async (c) => {
    return c.json(
      {
        error: "Image upload is not wired yet. Use Cloudinary flow instead.",
      },
      501
    );
  })
  .put("/", async (c) => {
    return c.json(
      {
        error: "Image ordering is not wired yet.",
      },
      501
    );
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const rows = await db
      .select()
      .from(images)
      .where(eq(images.id, id))
      .limit(1);
    if (rows.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }
    const image = rows[0];
    return c.json({
      ...image,
      cloudinaryId: image.publicId,
    });
  })
  .put("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : typeof body.name === "string"
          ? body.name.trim()
          : null;

    const updates: { title?: string | null; updatedAt?: Date } = {};
    if (title !== null) {
      updates.title = title || null;
    }
    if (Object.keys(updates).length === 0) {
      return c.json({ error: "No updates provided" }, 400);
    }
    updates.updatedAt = new Date();

    const updated = await db
      .update(images)
      .set(updates)
      .where(eq(images.id, id))
      .returning();

    if (updated.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }

    const image = updated[0];
    return c.json({
      ...image,
      cloudinaryId: image.publicId,
    });
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const deleted = await db
      .delete(images)
      .where(eq(images.id, id))
      .returning();
    if (deleted.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }
    const image = deleted[0];
    return c.json({
      ...image,
      cloudinaryId: image.publicId,
    });
  });

export default imagesRoutes;
