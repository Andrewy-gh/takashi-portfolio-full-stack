const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { Pool } = require("pg");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const Image = require("../../models/Image");
const ImageOrder = require("../../models/ImageOrder");

const requiredEnv = ["MONGODB_URI", "DATABASE_URL"];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing env vars: ${missing.join(", ")}`);
}

const ORDER_OUTPUT_PATH = path.resolve(
  __dirname,
  "mongo-image-order.json"
);

const HOME_CATEGORY_NAME = "Home";
const HOME_CATEGORY_SLUG = "home";

const tableExists = async (pool, tableName) => {
  const res = await pool.query(
    "SELECT to_regclass($1) AS table_name",
    [`public.${tableName}`]
  );
  return Boolean(res.rows[0]?.table_name);
};

const columnExists = async (pool, tableName, columnName) => {
  const res = await pool.query(
    `SELECT 1
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2`,
    [tableName, columnName]
  );
  return res.rowCount > 0;
};

const ensureCategory = async (
  pool,
  categoryName,
  categorySlug,
  supportsSlug
) => {
  if (!categoryName) {
    return null;
  }
  const findQuery = supportsSlug
    ? "SELECT id FROM categories WHERE slug = $1"
    : "SELECT id FROM categories WHERE name = $1";
  const findRes = await pool.query(findQuery, [
    supportsSlug ? categorySlug : categoryName,
  ]);
  if (findRes.rows.length > 0) {
    return findRes.rows[0].id;
  }

  const insertColumns = supportsSlug ? "name, slug" : "name";
  const insertValues = supportsSlug ? "$1, $2" : "$1";
  const insertQuery = `INSERT INTO categories (${insertColumns}) VALUES (${insertValues}) RETURNING id`;
  const insertRes = await pool.query(insertQuery, [
    categoryName,
    categorySlug,
  ]);
  return insertRes.rows[0]?.id ?? null;
};

const insertImageCategory = async (pool, imageId, categoryId) => {
  if (!imageId || !categoryId) {
    return;
  }
  try {
    await pool.query(
      "INSERT INTO image_categories (image_id, category_id) VALUES ($1, $2)",
      [imageId, categoryId]
    );
  } catch (error) {
    if (error && error.code === "23505") {
      return;
    }
    throw error;
  }
};

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const supportsCategoriesTable = await tableExists(pool, "categories");
    const supportsImageCategories = await tableExists(
      pool,
      "image_categories"
    );
    const supportsCategorySlug = supportsCategoriesTable
      ? await columnExists(pool, "categories", "slug")
      : false;
    const homeCategoryId =
      supportsCategoriesTable && supportsImageCategories
        ? await ensureCategory(
            pool,
            HOME_CATEGORY_NAME,
            HOME_CATEGORY_SLUG,
            supportsCategorySlug
          )
        : null;

    const images = await Image.find({}).lean();
    const existing = await pool.query("SELECT public_id FROM images");
    const existingPublicIds = new Set(
      existing.rows.map((row) => row.public_id)
    );

    let inserted = 0;
    let skipped = 0;
    let missingData = 0;

    for (const image of images) {
      const publicId = image.cloudinaryId;
      const url = image.url;
      if (!publicId || !url) {
        missingData += 1;
        continue;
      }

      if (existingPublicIds.has(publicId)) {
        skipped += 1;
        continue;
      }

      const insertRes = await pool.query(
        "INSERT INTO images (public_id, url, title, created_at) VALUES ($1, $2, $3, $4) RETURNING id",
        [publicId, url, image.title ?? null, image.createdAt ?? new Date()]
      );
      if (homeCategoryId && insertRes.rows?.[0]?.id) {
        await insertImageCategory(
          pool,
          insertRes.rows[0].id,
          homeCategoryId
        );
      }
      inserted += 1;
      existingPublicIds.add(publicId);
    }

    const imageOrder = await ImageOrder.findOne({}).lean();
    if (imageOrder?.order?.length) {
      const idMap = new Map(
        images.map((image) => [image._id.toString(), image.cloudinaryId])
      );
      const orderedPublicIds = imageOrder.order
        .map((id) => id.toString())
        .map((id) => idMap.get(id))
        .filter(Boolean);

      const payload = {
        generatedAt: new Date().toISOString(),
        count: orderedPublicIds.length,
        publicIds: orderedPublicIds,
      };

      fs.writeFileSync(ORDER_OUTPUT_PATH, JSON.stringify(payload, null, 2));
    }

    // eslint-disable-next-line no-console
    console.log(
      `Mongo -> Postgres migration done. inserted=${inserted} skipped=${skipped} missing=${missingData}`
    );
    if (fs.existsSync(ORDER_OUTPUT_PATH)) {
      // eslint-disable-next-line no-console
      console.log(`Image order exported: ${ORDER_OUTPUT_PATH}`);
    }
  } finally {
    await pool.end();
    await mongoose.disconnect();
  }
};

migrate().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
