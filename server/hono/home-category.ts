import { eq } from "drizzle-orm";
import { db } from "./db";
import { categories } from "./schema";

export const HOME_CATEGORY_SLUG = "home";
export const HOME_CATEGORY_NAME = "Home";

export const ensureHomeCategory = async () => {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, HOME_CATEGORY_SLUG))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const inserted = await db
    .insert(categories)
    .values({ name: HOME_CATEGORY_NAME, slug: HOME_CATEGORY_SLUG })
    .onConflictDoNothing()
    .returning({ id: categories.id });

  if (inserted.length > 0) {
    return inserted[0].id;
  }

  const fallback = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, HOME_CATEGORY_SLUG))
    .limit(1);

  return fallback[0]?.id ?? null;
};

