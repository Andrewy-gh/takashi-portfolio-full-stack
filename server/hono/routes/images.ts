import { Hono } from "hono";
import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { categories, imageCategories, images } from "../schema";
import { requireAdmin } from "../auth-utils";
import { z } from "zod";
import { ensureHomeCategory } from "../home-category";

const cloudinaryUpsertSchema = z.object({
  cloudinaryId: z.string().min(1),
  url: z.string().url(),
  title: z.string().optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

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
    const cloudinaryId = query.cloudinaryId?.trim();
    const sortColumn = getSortColumn(query.sort);
    const direction = query.direction === "asc" ? asc : desc;

    const idFilter = cloudinaryId ?? publicId;
    const whereClause = idFilter
      ? eq(images.cloudinaryId, idFilter)
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
      publicId: image.cloudinaryId,
    }));

    return c.json({
      page,
      pageSize,
      totalImages: count ?? 0,
      images: payload,
    });
  })
  .post("/from-cloudinary", async (c) => {
    const auth = requireAdmin(c.req.header("Authorization"));
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

    const body = await c.req.json().catch(() => null);
    const parsed = cloudinaryUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid payload" }, 400);
    }

    const { cloudinaryId, url, title, width, height, categoryIds } =
      parsed.data;

    const existing = await db
      .select()
      .from(images)
      .where(eq(images.cloudinaryId, cloudinaryId))
      .limit(1);

    let imageRow = existing[0] ?? null;

    if (!imageRow) {
      const inserted = await db
        .insert(images)
        .values({
          cloudinaryId,
          url,
          title: title?.trim() ? title.trim() : null,
          width: typeof width === "number" ? width : undefined,
          height: typeof height === "number" ? height : undefined,
        })
        .returning();
      imageRow = inserted[0] ?? null;
    } else {
      const updates: {
        url?: string;
        title?: string | null;
        width?: number | null;
        height?: number | null;
        updatedAt?: Date;
      } = {};

      if (url && url !== imageRow.url) updates.url = url;
      if (title !== undefined) {
        const nextTitle = title?.trim() ? title.trim() : null;
        if (nextTitle !== imageRow.title) updates.title = nextTitle;
      }
      if (width !== undefined && width !== imageRow.width) {
        updates.width = width ?? null;
      }
      if (height !== undefined && height !== imageRow.height) {
        updates.height = height ?? null;
      }

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        const updated = await db
          .update(images)
          .set(updates)
          .where(eq(images.id, imageRow.id))
          .returning();
        imageRow = updated[0] ?? imageRow;
      }
    }

    if (!imageRow) {
      return c.json({ error: "Failed to upsert image" }, 500);
    }

    const homeCategoryId = await ensureHomeCategory();
    if (homeCategoryId) {
      await db
        .insert(imageCategories)
        .values({ imageId: imageRow.id, categoryId: homeCategoryId })
        .onConflictDoNothing();
    }

    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      const found = await db
        .select({ id: categories.id })
        .from(categories)
        .where(inArray(categories.id, categoryIds));
      const foundSet = new Set(found.map((row) => row.id));
      const missing = categoryIds.filter((id) => !foundSet.has(id));
      if (missing.length > 0) {
        return c.json(
          { error: "Some categories not found", missingCategoryIds: missing },
          400
        );
      }

      for (const categoryId of categoryIds) {
        await db
          .insert(imageCategories)
          .values({ imageId: imageRow.id, categoryId })
          .onConflictDoNothing();
      }
    }

    return c.json({
      ...imageRow,
      publicId: imageRow.cloudinaryId,
    });
  })
  .post("/", async (c) => {
    return c.json({ error: "Use /api/images/from-cloudinary" }, 410);
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
      publicId: image.cloudinaryId,
    });
  })
  .put("/:id", async (c) => {
    const auth = requireAdmin(c.req.header("Authorization"));
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

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
      publicId: image.cloudinaryId,
    });
  })
  .delete("/:id", async (c) => {
    const auth = requireAdmin(c.req.header("Authorization"));
    if (!auth.ok) {
      return c.json({ error: auth.error }, auth.status);
    }

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
      publicId: image.cloudinaryId,
    });
  });

export default imagesRoutes;
