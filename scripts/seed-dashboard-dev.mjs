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

const rawArgs = process.argv.slice(2);
const args = parseArgs(rawArgs);

const isHelp =
  rawArgs.includes("--help") ||
  rawArgs.includes("-h") ||
  args.help === true;

if (isHelp) {
  console.log(
    [
      "seed:dashboard:dev",
      "",
      "Usage:",
      "  pnpm seed:dashboard:dev -- [options]",
      "",
      "Options:",
      "  --dir <path>                 Image directory (defaults to ../unsplash-downloader/photos_small)",
      "  --db-import <path>           Optional: ../unsplash-downloader/db-import.json (adds multi-category + alt titles)",
      "  --no-db-import               Disable db-import.json mapping",
      "  --limit <n>                  Default 30",
      "  --concurrency <n>            Default 3",
      "  --cloud-folder <name>        Default takashi-dev-seed",
      "  --category-mode <top|full>   Default top",
      "  --category-default <name>    Default uncategorized",
      "  --overwrite                  Overwrite Cloudinary public IDs",
      "  --dry-run                    Don't upload or write DB, still generates report",
      "  --no-db                      Upload to Cloudinary only (no Postgres writes)",
      "  --report <path>              Default server/hono/scripts/cloudinary-import-report.dev.json",
      "  --full                       Prefer ../unsplash-downloader/photos (default prefers photos_small)",
    ].join("\n")
  );
  process.exit(0);
}

const toNumber = (value, fallback) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

const preferFull = args.full === true || args.full === "true";
const baseRepoCandidates = [
  "../unsplash-downloader",
  "../unsplash-downloder", // user-typed alias (common typo)
];

const defaultDirCandidates = baseRepoCandidates.flatMap((base) => {
  return preferFull
    ? [`${base}/photos`, `${base}/photos_small`]
    : [`${base}/photos_small`, `${base}/photos`];
});

const selectedDir =
  (typeof args.dir === "string" && path.resolve(repoRoot, args.dir)) ||
  resolveExistingDir(defaultDirCandidates);

const disableDbImport =
  args["no-db-import"] === true || args["no-db-import"] === "true";
const dbImportCandidates = baseRepoCandidates.map(
  (base) => `${base}/db-import.json`
);
const selectedDbImport =
  disableDbImport
    ? null
    : (typeof args["db-import"] === "string"
        ? path.resolve(repoRoot, args["db-import"])
        : resolveExistingFile(dbImportCandidates));

if (!selectedDir) {
  console.error(
    `Seed failed: couldn't find image directory.\nTried: ${defaultDirCandidates
      .map((p) => path.resolve(repoRoot, p))
      .join(", ")}\nProvide one: node scripts/seed-dashboard-dev.mjs --dir ..\\unsplash-downloader\\photos_small`
  );
  process.exit(1);
}

const limit = toNumber(args.limit, 30);
const concurrency = toNumber(args.concurrency, 3);
const cloudFolder = typeof args["cloud-folder"] === "string" ? args["cloud-folder"] : "takashi-dev-seed";
const categoryMode = typeof args["category-mode"] === "string" ? args["category-mode"] : "top";
const categoryDefault = typeof args["category-default"] === "string" ? args["category-default"] : "uncategorized";
const reportPath =
  typeof args.report === "string"
    ? path.resolve(repoRoot, args.report)
    : path.resolve(repoRoot, "server/hono/scripts/cloudinary-import-report.dev.json");

// Delegate to existing importer via the server package script, so pnpm's workspace
// node_modules layout resolves dependencies reliably on Windows.
const importerArgs = [
  "--dir",
  selectedDir,
  ...(selectedDbImport ? ["--db-import", selectedDbImport] : []),
  "--limit",
  String(limit),
  "--concurrency",
  String(concurrency),
  "--cloud-folder",
  cloudFolder,
  "--category-mode",
  categoryMode,
  "--category-default",
  categoryDefault,
  "--report",
  reportPath,
];

if (args.overwrite === true || args.overwrite === "true") importerArgs.push("--overwrite");
if (args["dry-run"] === true || args["dry-run"] === "true") importerArgs.push("--dry-run");
if (args["no-db"] === true || args["no-db"] === "true") importerArgs.push("--no-db");

console.log(
  [
    "Seed dashboard dev:",
    `dir=${selectedDir}`,
    selectedDbImport ? `db-import=${selectedDbImport}` : "db-import=none",
    `limit=${limit}`,
    `cloud-folder=${cloudFolder}`,
    `report=${reportPath}`,
  ].join(" ")
);

const res = spawnSync(
  "pnpm",
  ["-C", "server", "cloud:batch", "--", ...importerArgs],
  {
    stdio: "inherit",
    env: process.env,
    cwd: repoRoot,
    shell: true,
  }
);

if (res.error) {
  console.error(`Seed failed to run pnpm: ${res.error.message}`);
}

process.exit(res.status ?? 1);
