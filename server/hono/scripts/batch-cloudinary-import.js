const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { v2: cloudinary } = require("cloudinary");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const parseArgs = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }
    const [key, inlineValue] = arg.slice(2).split("=");
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
};

const args = parseArgs(process.argv.slice(2));

const rootDir = args.dir || process.env.IMAGE_IMPORT_DIR;
if (!rootDir) {
  throw new Error("Provide --dir or set IMAGE_IMPORT_DIR.");
}

const resolvedRoot = path.resolve(rootDir);
if (!fs.existsSync(resolvedRoot)) {
  throw new Error(`Directory not found: ${resolvedRoot}`);
}

const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("CLOUD_NAME, API_KEY, and API_SECRET must be set.");
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && args["no-db"] !== true) {
  throw new Error("DATABASE_URL must be set unless --no-db is provided.");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".tif",
  ".tiff",
  ".bmp",
]);

const categoryMode = args["category-mode"] || "top";
const categoryDefault = args["category-default"] || "uncategorized";
const cloudFolderBase = args["cloud-folder"] || "takashi";
const concurrency = Math.max(Number(args.concurrency || 3), 1);
const limit = args.limit ? Number(args.limit) : null;
const overwrite = args.overwrite === true;
const dryRun = args["dry-run"] === true;
const useDb = args["no-db"] !== true;
const reportPath =
  args.report ||
  path.resolve(__dirname, "cloudinary-import-report.json");

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleFromFilename = (filename) =>
  filename.replace(/[_-]+/g, " ").trim();

const getCategory = (filePath) => {
  const relativeDir = path.relative(resolvedRoot, path.dirname(filePath));
  if (relativeDir === "." || relativeDir === "") {
    return categoryDefault;
  }
  const segments = relativeDir.split(path.sep).filter(Boolean);
  if (segments.length === 0) {
    return categoryDefault;
  }
  if (categoryMode === "full") {
    return segments.join("/");
  }
  return segments[0];
};

const buildPublicId = (filePath) => {
  const ext = path.extname(filePath);
  const relative = path.relative(resolvedRoot, filePath);
  const withoutExt = relative.slice(0, -ext.length);
  const segments = withoutExt
    .split(path.sep)
    .map((segment) => slugify(segment))
    .filter(Boolean);
  if (cloudFolderBase) {
    segments.unshift(slugify(cloudFolderBase));
  }
  return segments.join("/");
};

const walkFiles = (dir, results = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (allowedExtensions.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
};

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

const insertImage = async (
  pool,
  imageData,
  supportsCategoryColumn,
  supportsWidth,
  supportsHeight
) => {
  const existing = await pool.query(
    "SELECT id FROM images WHERE public_id = $1",
    [imageData.publicId]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const columns = ["public_id", "url", "title", "created_at"];
  const values = [
    imageData.publicId,
    imageData.url,
    imageData.title,
    imageData.createdAt,
  ];

  if (supportsCategoryColumn) {
    columns.push("category");
    values.push(imageData.category);
  }
  if (supportsWidth) {
    columns.push("width");
    values.push(imageData.width);
  }
  if (supportsHeight) {
    columns.push("height");
    values.push(imageData.height);
  }

  const placeholders = values.map((_, idx) => `$${idx + 1}`).join(", ");
  const insertQuery = `INSERT INTO images (${columns.join(
    ", "
  )}) VALUES (${placeholders}) RETURNING id`;
  const insertRes = await pool.query(insertQuery, values);
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

const getExistingPublicIds = async (pool) => {
  const res = await pool.query("SELECT public_id FROM images");
  return new Set(res.rows.map((row) => row.public_id));
};

const main = async () => {
  const files = walkFiles(resolvedRoot);
  const total = limit ? Math.min(files.length, limit) : files.length;
  const queue = files.slice(0, total);
  if (queue.length === 0) {
    // eslint-disable-next-line no-console
    console.log("No image files found.");
    return;
  }

  const pool = useDb ? new Pool({ connectionString: databaseUrl }) : null;
  let supportsCategoryColumn = false;
  let supportsWidth = false;
  let supportsHeight = false;
  let supportsCategoriesTable = false;
  let supportsImageCategories = false;
  let supportsCategorySlug = false;
  let existingPublicIds = new Set();

  if (pool) {
    supportsCategoryColumn = await columnExists(pool, "images", "category");
    supportsWidth = await columnExists(pool, "images", "width");
    supportsHeight = await columnExists(pool, "images", "height");
    supportsCategoriesTable = await tableExists(pool, "categories");
    supportsImageCategories = await tableExists(pool, "image_categories");
    supportsCategorySlug = supportsCategoriesTable
      ? await columnExists(pool, "categories", "slug")
      : false;
    existingPublicIds = await getExistingPublicIds(pool);
  }

  let processed = 0;
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const report = [];

  let cursor = 0;
  const nextFile = () => {
    if (cursor >= queue.length) {
      return null;
    }
    const file = queue[cursor];
    cursor += 1;
    return file;
  };

  const worker = async () => {
    while (true) {
      const file = nextFile();
      if (!file) {
        return;
      }

      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const category = getCategory(file);
      const categorySlug = slugify(category);
      const title = titleFromFilename(baseName);
      const publicId = buildPublicId(file);

      const entry = {
        file,
        publicId,
        category,
        title,
        status: "pending",
      };

      try {
        if (useDb && existingPublicIds.has(publicId)) {
          entry.status = "skipped";
          skipped += 1;
        } else if (dryRun) {
          entry.status = "dry-run";
        } else {
          let uploadResult;
          try {
            uploadResult = await cloudinary.uploader.upload(file, {
              resource_type: "image",
              public_id: publicId,
              overwrite,
              context: { title, category },
              tags: categorySlug ? [categorySlug] : undefined,
            });
          } catch (error) {
            const message =
              error?.error?.message || error?.message || "Upload failed";
            const conflict =
              error?.http_code === 409 ||
              /already exists/i.test(message);
            if (conflict) {
              uploadResult = await cloudinary.api.resource(publicId, {
                resource_type: "image",
              });
            } else {
              throw error;
            }
          }

          const data = {
            publicId,
            url: uploadResult.secure_url,
            title: title || null,
            category,
            width: uploadResult.width ?? null,
            height: uploadResult.height ?? null,
            createdAt: new Date(),
          };

          if (useDb && pool) {
            const imageId = await insertImage(
              pool,
              data,
              supportsCategoryColumn,
              supportsWidth,
              supportsHeight
            );
            existingPublicIds.add(publicId);

            if (supportsCategoriesTable && supportsImageCategories) {
              const categoryId = await ensureCategory(
                pool,
                category,
                categorySlug,
                supportsCategorySlug
              );
              await insertImageCategory(pool, imageId, categoryId);
            }
          }

          entry.status = "uploaded";
          entry.url = uploadResult.secure_url;
          entry.width = uploadResult.width;
          entry.height = uploadResult.height;
          uploaded += 1;
        }
      } catch (error) {
        entry.status = "failed";
        entry.error = error?.message || String(error);
        failed += 1;
      } finally {
        processed += 1;
        report.push(entry);
        if (processed % 10 === 0 || processed === total) {
          // eslint-disable-next-line no-console
          console.log(
            `Processed ${processed}/${total} (uploaded=${uploaded} skipped=${skipped} failed=${failed})`
          );
        }
      }
    }
  };

  try {
    await Promise.all(
      Array.from({ length: concurrency }, () => worker())
    );
  } finally {
    if (pool) {
      await pool.end();
    }
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // eslint-disable-next-line no-console
  console.log(
    `Done. uploaded=${uploaded} skipped=${skipped} failed=${failed}`
  );
  // eslint-disable-next-line no-console
  console.log(`Report: ${reportPath}`);
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Batch import failed:", error);
  process.exitCode = 1;
});
