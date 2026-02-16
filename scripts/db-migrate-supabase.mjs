#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const HELP_TEXT = `
Supabase DB migration helper (Docker-based, no local pg_dump/psql required).

Usage:
  node scripts/db-migrate-supabase.mjs [options]

Options:
  --source-url <url>   Source Postgres URL (default: DATABASE_URL from .env/server/.env)
  --target-url <url>   Target Postgres URL (default: SUPABASE_MIGRATION_DB_URL or SUPABASE_DB_URL)
  --dump-file <path>   Dump file path (default: .tmp/supabase-migrate/dev-<timestamp>.dump)
  --skip-dump          Skip pg_dump step (expects --dump-file to already exist)
  --skip-restore       Skip restore step
  --skip-parity        Skip row-count parity check step
  --keep-dump          Keep dump file after completion
  --dry-run            Print planned steps only
  --yes                Required for restore (safety guard)
  --help               Show this help

Examples:
  node scripts/db-migrate-supabase.mjs --target-url "postgresql://...supabase..."
  node scripts/db-migrate-supabase.mjs --dry-run --target-url "postgresql://...supabase..."
  node scripts/db-migrate-supabase.mjs --skip-restore --skip-parity
`;

const REQUIRED_TABLES = ["images", "categories", "image_categories", "users"];

const parseArgs = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
};

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) return;
  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    if (!key || process.env[key] !== undefined) continue;
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
};

const redactUrl = (url) => {
  try {
    const parsed = new URL(url);
    const dbName = parsed.pathname.replace(/^\//, "") || "(db)";
    const user = parsed.username || "(user)";
    const host = parsed.host || "(host)";
    return `${parsed.protocol}//${user}:***@${host}/${dbName}`;
  } catch {
    return "(redacted-url)";
  }
};

const redactArg = (value) => {
  if (typeof value !== "string") return String(value);
  if (
    value.startsWith("postgres://") ||
    value.startsWith("postgresql://")
  ) {
    return redactUrl(value);
  }
  return value;
};

const run = async (cmd, args, { dryRun = false } = {}) => {
  const display = [cmd, ...args.map(redactArg)].join(" ");
  if (dryRun) {
    console.log(`[dry-run] ${display}`);
    return "";
  }

  await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: false,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed (${code}): ${display}`));
      }
    });
  });
  return "";
};

const runCapture = async (cmd, args, { dryRun = false } = {}) => {
  const display = [cmd, ...args.map(redactArg)].join(" ");
  if (dryRun) {
    console.log(`[dry-run] ${display}`);
    return "";
  }

  return await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(
          new Error(
            `Command failed (${code}): ${display}\n${stderr || stdout}`
          )
        );
      }
    });
  });
};

const resolveCounts = async (dbUrl, { dryRun }) => {
  const sql = REQUIRED_TABLES.map(
    (table) => `select '${table}' as table_name, count(*)::bigint as row_count from ${table}`
  ).join(" union all ");

  const out = await runCapture(
    "docker",
    ["run", "--rm", "postgres:16", "psql", dbUrl, "-At", "-c", sql],
    { dryRun }
  );

  const entries = out
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [table, count] = line.split("|");
      return [table, Number(count)];
    });

  return Object.fromEntries(entries);
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP_TEXT.trim());
    return;
  }

  const repoRoot = process.cwd();
  loadEnvFile(path.resolve(repoRoot, ".env.prod"));
  loadEnvFile(path.resolve(repoRoot, ".env"));
  loadEnvFile(path.resolve(repoRoot, "server/.env"));

  const dryRun = Boolean(args["dry-run"]);
  const skipDump = Boolean(args["skip-dump"]);
  const skipRestore = Boolean(args["skip-restore"]);
  const skipParity = Boolean(args["skip-parity"]);
  const keepDump = Boolean(args["keep-dump"]);
  const confirm = Boolean(args.yes);

  const sourceUrl =
    args["source-url"] ??
    process.env.SOURCE_DATABASE_URL ??
    process.env.DATABASE_URL;
  const targetUrl =
    args["target-url"] ??
    process.env.SUPABASE_MIGRATION_DB_URL ??
    process.env.SUPABASE_DB_URL ??
    process.env.TARGET_DATABASE_URL;

  if (!sourceUrl) {
    throw new Error(
      "Missing source DB URL. Set DATABASE_URL (or pass --source-url)."
    );
  }
  if (!skipRestore && !targetUrl) {
    throw new Error(
      "Missing target DB URL. Set SUPABASE_DB_URL (or pass --target-url)."
    );
  }
  if (!skipRestore && !dryRun && !confirm) {
    throw new Error(
      "Restore is destructive for target schema. Re-run with --yes to confirm."
    );
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dumpFileRel =
    args["dump-file"] ?? `.tmp/supabase-migrate/dev-${timestamp}.dump`;
  const dumpFileAbs = path.resolve(repoRoot, dumpFileRel);
  const dumpFileContainer = `/work/${path
    .relative(repoRoot, dumpFileAbs)
    .replace(/\\/g, "/")}`;

  console.log("Supabase migration config:");
  console.log(`- source: ${redactUrl(sourceUrl)}`);
  console.log(`- target: ${targetUrl ? redactUrl(targetUrl) : "(skipped)"}`);
  console.log(`- dump:   ${path.relative(repoRoot, dumpFileAbs)}`);
  console.log(
    `- flags:  ${[
      skipDump ? "skip-dump" : null,
      skipRestore ? "skip-restore" : null,
      skipParity ? "skip-parity" : null,
      keepDump ? "keep-dump" : null,
      dryRun ? "dry-run" : null,
    ]
      .filter(Boolean)
      .join(", ") || "(none)"}`
  );

  await run("docker", ["--version"], { dryRun });

  if (!skipDump) {
    mkdirSync(path.dirname(dumpFileAbs), { recursive: true });
    await run(
      "docker",
      [
        "run",
        "--rm",
        "-v",
        `${repoRoot}:/work`,
        "postgres:16",
        "pg_dump",
        sourceUrl,
        "--format=custom",
        "--no-owner",
        "--no-privileges",
        "--schema=public",
        "--file",
        dumpFileContainer,
      ],
      { dryRun }
    );
  }

  if (!skipRestore) {
    await run(
      "docker",
      [
        "run",
        "--rm",
        "-v",
        `${repoRoot}:/work`,
        "postgres:16",
        "pg_restore",
        "--clean",
        "--if-exists",
        "--no-owner",
        "--no-privileges",
        "--dbname",
        targetUrl,
        dumpFileContainer,
      ],
      { dryRun }
    );
  }

  if (!skipParity && !skipRestore) {
    const sourceCounts = await resolveCounts(sourceUrl, { dryRun });
    const targetCounts = await resolveCounts(targetUrl, { dryRun });

    const summary = REQUIRED_TABLES.map((table) => {
      const source = sourceCounts[table] ?? 0;
      const target = targetCounts[table] ?? 0;
      return {
        table,
        source,
        target,
        match: source === target ? "OK" : "MISMATCH",
      };
    });

    console.log("Parity summary:");
    summary.forEach(({ table, source, target, match }) => {
      console.log(`- ${table}: source=${source} target=${target} [${match}]`);
    });

    const mismatches = summary.filter((row) => row.match !== "OK");
    if (mismatches.length > 0) {
      throw new Error("Parity check failed (row-count mismatch).");
    }
  }

  if (!keepDump && !skipDump) {
    if (dryRun) {
      console.log(`[dry-run] rm ${path.relative(repoRoot, dumpFileAbs)}`);
    } else {
      rmSync(dumpFileAbs, { force: true });
    }
  }

  console.log("Done.");
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
