import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();

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

const sanitizePublicIdSegment = (value) =>
  String(value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleFromFilename = (filename) => filename.replace(/[_-]+/g, " ").trim();

const truncate = (value, max) => {
  if (!value) return value;
  const str = String(value);
  if (str.length <= max) return str;
  return `${str.slice(0, Math.max(0, max - 3)).trim()}...`;
};

const resolveExistingDir = (candidates) => {
  for (const candidate of candidates) {
    const full = path.resolve(repoRoot, candidate);
    try {
      if (fs.statSync(full).isDirectory()) return full;
    } catch {
      // ignore
    }
  }
  return null;
};

const resolveExistingFile = (candidates) => {
  for (const candidate of candidates) {
    const full = path.resolve(repoRoot, candidate);
    try {
      if (fs.statSync(full).isFile()) return full;
    } catch {
      // ignore
    }
  }
  return null;
};

const loadDbImport = (value) => {
  if (!value) return null;
  const resolved = path.resolve(repoRoot, value);
  if (!fs.existsSync(resolved)) return null;
  const raw = fs.readFileSync(resolved, "utf8");
  const parsed = JSON.parse(raw);

  const photos = Array.isArray(parsed.photos) ? parsed.photos : [];
  const categories = Array.isArray(parsed.categories) ? parsed.categories : [];
  const photoCategories = Array.isArray(parsed.photo_categories)
    ? parsed.photo_categories
    : [];

  const photoMetaById = new Map();
  for (const photo of photos) {
    if (photo && typeof photo.id === "string") photoMetaById.set(photo.id, photo);
  }

  const categoryLabelById = new Map();
  for (const category of categories) {
    if (category && typeof category.id === "string") {
      categoryLabelById.set(category.id, category.label || category.id);
    }
  }

  const categoryIdsByPhotoId = new Map();
  for (const entry of photoCategories) {
    const photoId = entry?.photo_id;
    const categoryId = entry?.category_id;
    if (typeof photoId !== "string" || typeof categoryId !== "string") continue;
    if (!categoryIdsByPhotoId.has(photoId)) categoryIdsByPhotoId.set(photoId, new Set());
    categoryIdsByPhotoId.get(photoId).add(categoryId);
  }

  return { photoMetaById, categoryLabelById, categoryIdsByPhotoId };
};

const inferCloudNameFromReport = (reportPath) => {
  if (!fs.existsSync(reportPath)) return null;
  try {
    const raw = fs.readFileSync(reportPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    for (const entry of parsed) {
      const url = entry?.url;
      if (typeof url !== "string") continue;
      const match = url.match(/res\.cloudinary\.com\/([^/]+)\//i);
      if (match?.[1]) return match[1];
    }
    return null;
  } catch {
    return null;
  }
};

const listImageFiles = (rootDir) => {
  const allowed = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff", ".bmp"]);
  const out = [];

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (!allowed.has(ext)) continue;
      out.push(full);
    }
  };

  walk(rootDir);
  return out;
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));

  const preferFull = args.full === true || args.full === "true";
  const baseRepoCandidates = ["../unsplash-downloader", "../unsplash-downloder"];
  const defaultDirCandidates = baseRepoCandidates.flatMap((base) =>
    preferFull ? [`${base}/photos`, `${base}/photos_small`] : [`${base}/photos_small`, `${base}/photos`]
  );

  const selectedDir =
    (typeof args.dir === "string" && path.resolve(repoRoot, args.dir)) ||
    resolveExistingDir(defaultDirCandidates);

  if (!selectedDir) {
    throw new Error(
      `Seed DB failed: couldn't find image directory. Tried: ${defaultDirCandidates
        .map((p) => path.resolve(repoRoot, p))
        .join(", ")}`
    );
  }

  const dbImportPath =
    typeof args["db-import"] === "string"
      ? args["db-import"]
      : resolveExistingFile(baseRepoCandidates.map((base) => `${base}/db-import.json`));
  const dbImport = loadDbImport(dbImportPath);

  const cloudFolder = typeof args["cloud-folder"] === "string" ? args["cloud-folder"] : "takashi-dev-seed";
  const categoryDefault = typeof args["category-default"] === "string" ? args["category-default"] : "uncategorized";

  const outReportPath =
    typeof args.report === "string"
      ? path.resolve(repoRoot, args.report)
      : path.resolve(repoRoot, "server/hono/scripts/cloudinary-import-report.local.json");

  const existingDevReport = path.resolve(repoRoot, "server/hono/scripts/cloudinary-import-report.dev.json");
  const cloudName =
    (typeof args["cloud-name"] === "string" ? args["cloud-name"] : null) ||
    inferCloudNameFromReport(existingDevReport);

  if (!cloudName) {
    throw new Error(
      "Missing --cloud-name and couldn't infer it from server/hono/scripts/cloudinary-import-report.dev.json"
    );
  }

  const files = listImageFiles(selectedDir);
  const limit = args.limit ? Math.max(Number(args.limit), 1) : null;
  const selectedFiles = limit ? files.slice(0, limit) : files;

  const report = [];
  for (const file of selectedFiles) {
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);
    const photoId = baseName;
    const dbMeta = dbImport?.photoMetaById?.get(photoId) ?? null;
    const dbCategoryIds = dbImport?.categoryIdsByPhotoId?.get(photoId) ?? null;

    const mappedCategories = dbCategoryIds
      ? Array.from(dbCategoryIds)
          .map((id) => ({
            id,
            name: dbImport?.categoryLabelById?.get(id) ?? id,
            slug: slugify(dbImport?.categoryLabelById?.get(id) ?? id),
          }))
          .filter((entry) => Boolean(entry.slug))
      : [];

    const category = mappedCategories.length > 0 ? mappedCategories[0].name : categoryDefault;
    const title = truncate(
      (typeof dbMeta?.alt === "string" ? dbMeta.alt.trim() : "") || titleFromFilename(baseName),
      120
    );

    const publicId = `${cloudFolder}/${sanitizePublicIdSegment(baseName)}`;

    report.push({
      file,
      publicId,
      category,
      title,
      status: "local",
      // url/width/height intentionally omitted; DB seed script will create a fallback URL.
    });
  }

  fs.writeFileSync(outReportPath, JSON.stringify(report, null, 2));

  // eslint-disable-next-line no-console
  console.log(`Wrote report: ${outReportPath} entries=${report.length} cloudName=${cloudName}`);

  const res = spawnSync(
    "pnpm",
    ["-C", "server", "cloud:db:seed:report", "--", "--report", outReportPath, "--cloud-name", cloudName],
    {
      stdio: "inherit",
      env: process.env,
      cwd: repoRoot,
      shell: true,
    }
  );

  process.exit(res.status ?? 1);
};

main();

