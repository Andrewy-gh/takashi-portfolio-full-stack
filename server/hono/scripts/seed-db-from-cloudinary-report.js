const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const parseArgs = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
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

const slugify = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const inferCloudNameFromUrl = (url) => {
  if (!url) return null;
  const match = String(url).match(/res\.cloudinary\.com\/([^/]+)\//i);
  return match?.[1] ?? null;
};

const buildFallbackUrl = ({ cloudName, publicId, filePath }) => {
  if (!cloudName || !publicId) return null;
  const ext = filePath ? path.extname(filePath) : "";
  const safeExt = ext && ext.startsWith(".") ? ext : "";
  // No version in URL: ok for seeding; Cloudinary will still resolve the asset.
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}${safeExt}`;
};

const resolveDatabaseUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const port = process.env.DB_PORT || "5432";
  const name = process.env.DB_NAME || "takashi_photos";
  const user = process.env.DB_USER || "postgres";
  const password = process.env.DB_PASSWORD || "postgres";

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
    password
  )}@localhost:${port}/${name}`;
};

const ensureCategory = async (pool, name, slug) => {
  const bySlug = await pool.query(
    `SELECT id FROM categories WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  if (bySlug.rows[0]?.id) return bySlug.rows[0].id;

  const byName = await pool.query(
    `SELECT id FROM categories WHERE name = $1 LIMIT 1`,
    [name]
  );
  if (byName.rows[0]?.id) return byName.rows[0].id;

  const inserted = await pool.query(
    `
      INSERT INTO categories (name, slug)
      VALUES ($1, $2)
      RETURNING id
    `,
    [name, slug]
  );
  return inserted.rows[0]?.id ?? null;
};

const ensureHomeCategory = async (pool) => {
  return ensureCategory(pool, "Home", "home");
};

const upsertImage = async (pool, { cloudinaryId, url, title, width, height }) => {
  const res = await pool.query(
    `
      INSERT INTO images (cloudinary_id, url, title, width, height)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (cloudinary_id) DO UPDATE SET
        url = EXCLUDED.url,
        title = EXCLUDED.title,
        width = EXCLUDED.width,
        height = EXCLUDED.height,
        updated_at = NOW()
      RETURNING id
    `,
    [cloudinaryId, url, title ?? null, width ?? null, height ?? null]
  );
  return res.rows[0]?.id ?? null;
};

const linkImageCategory = async (pool, imageId, categoryId) => {
  if (!imageId || !categoryId) return;
  await pool.query(
    `
      INSERT INTO image_categories (image_id, category_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `,
    [imageId, categoryId]
  );
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  const isHelp = args.help === true || args.h === true;
  if (isHelp) {
    // eslint-disable-next-line no-console
    console.log(
      [
        "cloud:db:seed:report",
        "",
        "Seeds Postgres from a Cloudinary import report JSON (no Cloudinary API calls).",
        "",
        "Usage:",
        "  pnpm -C server cloud:db:seed:report -- [options]",
        "",
        "Options:",
        "  --report <path>       Default server/hono/scripts/cloudinary-import-report.dev.json",
        "  --cloud-name <name>   Optional. If omitted, inferred from first entry with url.",
        "  --dry-run             Print counts only; no DB writes.",
      ].join("\n")
    );
    return;
  }

  const repoRoot = path.resolve(__dirname, "../../..");
  const reportPath =
    typeof args.report === "string"
      ? path.resolve(repoRoot, args.report)
      : path.resolve(repoRoot, "server/hono/scripts/cloudinary-import-report.dev.json");

  if (!fs.existsSync(reportPath)) {
    throw new Error(`Report not found: ${reportPath}`);
  }

  const raw = fs.readFileSync(reportPath, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("Report JSON must be an array.");
  }

  const cloudNameFromArgs = typeof args["cloud-name"] === "string" ? args["cloud-name"] : null;
  const cloudNameFromReport =
    cloudNameFromArgs ||
    data.map((e) => inferCloudNameFromUrl(e?.url)).find((v) => Boolean(v)) ||
    null;

  const dryRun = args["dry-run"] === true || args["dry-run"] === "true";

  const connectionString = resolveDatabaseUrl();
  const pool = new Pool({ connectionString });

  let insertedOrUpdated = 0;
  let linked = 0;
  let skippedNoUrl = 0;
  let failed = 0;

  try {
    if (dryRun) {
      // eslint-disable-next-line no-console
      console.log(
        `Dry run. report=${reportPath} cloudName=${cloudNameFromReport ?? "unknown"} db=${connectionString.replace(
          /:\/\/[^@]+@/,
          "://***@"
        )}`
      );
      // eslint-disable-next-line no-console
      console.log(`Entries: ${data.length}`);
      return;
    }

    const homeCategoryId = await ensureHomeCategory(pool);

    for (const entry of data) {
      try {
        const cloudinaryId = entry?.publicId ? String(entry.publicId) : null;
        if (!cloudinaryId) continue;

        const url =
          (typeof entry.url === "string" && entry.url.trim()) ||
          buildFallbackUrl({
            cloudName: cloudNameFromReport,
            publicId: cloudinaryId,
            filePath: typeof entry.file === "string" ? entry.file : null,
          });

        if (!url) {
          skippedNoUrl += 1;
          continue;
        }

        const title =
          typeof entry.title === "string" && entry.title.trim()
            ? entry.title.trim()
            : null;
        const width = Number.isFinite(entry.width) ? entry.width : null;
        const height = Number.isFinite(entry.height) ? entry.height : null;

        const imageId = await upsertImage(pool, {
          cloudinaryId,
          url,
          title,
          width,
          height,
        });
        if (!imageId) continue;
        insertedOrUpdated += 1;

        const categoryName =
          typeof entry.category === "string" && entry.category.trim()
            ? entry.category.trim()
            : null;

        if (categoryName) {
          const categoryId = await ensureCategory(
            pool,
            categoryName,
            slugify(categoryName)
          );
          await linkImageCategory(pool, imageId, categoryId);
          linked += 1;
        }

        if (homeCategoryId) {
          await linkImageCategory(pool, imageId, homeCategoryId);
        }
      } catch (error) {
        failed += 1;
        // eslint-disable-next-line no-console
        console.error(
          "Seed entry failed",
          entry?.publicId ?? entry?.file ?? "unknown",
          error?.message ?? String(error)
        );
      }
    }
  } finally {
    await pool.end();
  }

  // eslint-disable-next-line no-console
  console.log(
    `Done. upserted=${insertedOrUpdated} linked=${linked} skippedNoUrl=${skippedNoUrl} failed=${failed}`
  );
};

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error?.message ?? error);
  process.exit(1);
});
