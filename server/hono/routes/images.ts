import { Hono } from "hono";
import { desc } from "drizzle-orm";
import { db } from "../db";
import { images } from "../schema";

const imagesRoutes = new Hono().get("/", async (c) => {
  const rows = await db.select().from(images).orderBy(desc(images.createdAt));
  const payload = rows.map((image) => ({
    ...image,
    cloudinaryId: image.publicId,
  }));
  return c.json(payload);
});

export default imagesRoutes;
