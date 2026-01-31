import { Hono } from "hono";
import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { categories, imageCategories, images } from "../schema";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const resolveCategorySort = (sortMode: string | null | undefined) => {
  switch (sortMode) {
    case "custom":
      return [
        sql`${imageCategories.position} is null`,
        asc(imageCategories.position),
        desc(images.createdAt),
      ];
    case "created_at":
      return [desc(images.createdAt)];
    case "created_at_asc":
      return [asc(images.createdAt)];
    case "title":
    case "title_asc":
      return [asc(images.title)];
    case "title_desc":
      return [desc(images.title)];
    case "created_at_desc":
    default:
      return [desc(images.createdAt)];
  }
};

const fetchCategoryImages = async (categoryId: string, sortMode: string) => {
  return db
    .select({
      id: images.id,
      url: images.url,
      title: images.title,
      createdAt: images.createdAt,
      updatedAt: images.updatedAt,
      width: images.width,
      height: images.height,
      position: imageCategories.position,
    })
    .from(imageCategories)
    .innerJoin(images, eq(imageCategories.imageId, images.id))
    .where(eq(imageCategories.categoryId, categoryId))
    .orderBy(...resolveCategorySort(sortMode));
};

const categoriesRoutes = new Hono()
  .get("/", async (c) => {
    const query = c.req.query();
    const search = query.search?.trim();

    const whereClause = search
      ? ilike(categories.name, `%${search}%`)
      : undefined;

    const rows = await db
      .select()
      .from(categories)
      .where(whereClause)
      .orderBy(asc(categories.sequence), asc(categories.name));

    if (rows.length === 0) {
      return c.json([]);
    }

    const ids = rows.map((row) => row.id);
    const counts = await db
      .select({
        categoryId: imageCategories.categoryId,
        total: sql<number>`count(*)`,
      })
      .from(imageCategories)
      .where(inArray(imageCategories.categoryId, ids))
      .groupBy(imageCategories.categoryId);

    const countMap = new Map(
      counts.map((row) => [row.categoryId, Number(row.total ?? 0)])
    );

    const payload = rows.map((row) => ({
      ...row,
      totalImages: countMap.get(row.id) ?? 0,
      thumbnailUrl: null,
    }));

    return c.json(payload);
  })
  .post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : null;
    const sortMode =
      typeof body.sortMode === "string" && body.sortMode
        ? body.sortMode
        : undefined;

    if (!name) {
      return c.json({ error: "Name is required" }, 400);
    }

    const slug = slugify(name);
    const inserted = await db
      .insert(categories)
      .values({
        name,
        slug,
        description,
        sortMode,
      })
      .onConflictDoNothing()
      .returning();

    if (inserted.length === 0) {
      return c.json({ error: "Category already exists" }, 409);
    }

    return c.json(inserted[0]);
  })
  .get("/select", async (c) => {
    const rows = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.name));
    return c.json(rows);
  })
  .get("/table", async (c) => {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        sequence: categories.sequence,
      })
      .from(categories)
      .orderBy(asc(categories.sequence), asc(categories.name));

    if (rows.length === 0) {
      return c.json([]);
    }

    const ids = rows.map((row) => row.id);
    const counts = await db
      .select({
        categoryId: imageCategories.categoryId,
        total: sql<number>`count(*)`,
      })
      .from(imageCategories)
      .where(inArray(imageCategories.categoryId, ids))
      .groupBy(imageCategories.categoryId);

    const countMap = new Map(
      counts.map((row) => [row.categoryId, Number(row.total ?? 0)])
    );

    const payload = rows.map((row) => ({
      ...row,
      totalImages: countMap.get(row.id) ?? 0,
    }));

    return c.json(payload);
  })
  .put("/table", async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!Array.isArray(body)) {
      return c.json({ error: "Invalid payload" }, 400);
    }

    const updates = body
      .map((entry) => ({
        id: typeof entry.id === "string" ? entry.id : null,
        sequence:
          typeof entry.sequence === "number" ? entry.sequence : null,
      }))
      .filter((entry) => Boolean(entry.id));

    for (const update of updates) {
      await db
        .update(categories)
        .set({ sequence: update.sequence, updatedAt: new Date() })
        .where(eq(categories.id, update.id!));
    }

    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        sequence: categories.sequence,
      })
      .from(categories)
      .orderBy(asc(categories.sequence), asc(categories.name));
    return c.json(rows);
  })
  .get("/preview", async (c) => {
    const rows = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sequence), asc(categories.name));

    const payload = await Promise.all(
      rows.map(async (row) => {
        const images = await fetchCategoryImages(
          row.id,
          row.sortMode ?? "custom"
        );
        return {
          ...row,
          images,
        };
      })
    );

    return c.json(payload);
  })
  .put("/:id/images/positions", async (c) => {
    const categoryId = c.req.param("id");
    const body = await c.req.json().catch(() => null);
    if (!Array.isArray(body)) {
      return c.json({ error: "Invalid payload" }, 400);
    }

    const updates = body
      .map((entry) => ({
        id: typeof entry?.id === "string" ? entry.id : null,
        position: Number.isFinite(entry?.position)
          ? Number(entry.position)
          : entry?.position === null
            ? null
            : undefined,
      }))
      .filter((entry) => Boolean(entry.id));

    if (updates.length === 0) {
      return c.json({ error: "No updates provided" }, 400);
    }

    const seenIds = new Set<string>();
    for (const update of updates) {
      if (!update.id) continue;
      if (seenIds.has(update.id)) {
        return c.json({ error: "Duplicate image ids" }, 400);
      }
      seenIds.add(update.id);
    }

    const positions = updates
      .map((update) => update.position)
      .filter((position): position is number => typeof position === "number");
    for (const position of positions) {
      if (!Number.isInteger(position) || position < 1) {
        return c.json({ error: "Positions must be positive integers" }, 400);
      }
    }
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== positions.length) {
      return c.json({ error: "Duplicate positions" }, 400);
    }

    const existingCategory = await db
      .select({ id: categories.id, sortMode: categories.sortMode })
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);
    if (existingCategory.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }

    const existingImages = await db
      .select({ imageId: imageCategories.imageId })
      .from(imageCategories)
      .where(eq(imageCategories.categoryId, categoryId));
    const existingSet = new Set(
      existingImages.map((row) => row.imageId)
    );
    for (const update of updates) {
      if (update.id && !existingSet.has(update.id)) {
        return c.json({ error: "Image not in category" }, 400);
      }
    }

    await db.transaction(async (tx) => {
      await tx
        .update(categories)
        .set({ sortMode: "custom", updatedAt: new Date() })
        .where(eq(categories.id, categoryId));

      await tx
        .update(imageCategories)
        .set({ position: null })
        .where(eq(imageCategories.categoryId, categoryId));

      for (const update of updates) {
        if (!update.id || update.position === undefined) continue;
        await tx
          .update(imageCategories)
          .set({ position: update.position })
          .where(
            and(
              eq(imageCategories.categoryId, categoryId),
              eq(imageCategories.imageId, update.id)
            )
          );
      }
    });

    const images = await fetchCategoryImages(categoryId, "custom");
    return c.json({ ok: true, images });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const rows = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (rows.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }

    const category = rows[0];
    const images = await fetchCategoryImages(
      category.id,
      category.sortMode ?? "custom"
    );

    return c.json({
      ...category,
      images,
    });
  })
  .put("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : null;
    const description =
      typeof body.description === "string" ? body.description.trim() : null;
    const sortMode =
      typeof body.sortMode === "string" && body.sortMode
        ? body.sortMode
        : null;

    const updates: {
      name?: string;
      slug?: string;
      description?: string | null;
      sortMode?: string;
      updatedAt?: Date;
    } = {};

    if (name) {
      updates.name = name;
      updates.slug = slugify(name);
    }
    if (description !== null) {
      updates.description = description || null;
    }
    if (sortMode) {
      updates.sortMode = sortMode;
    }

    if (Object.keys(updates).length === 0) {
      return c.json({ error: "No updates provided" }, 400);
    }

    updates.updatedAt = new Date();

    const updated = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();

    if (updated.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json(updated[0]);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const deleted = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    if (deleted.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }
    return c.json(deleted[0]);
  });

export default categoriesRoutes;
