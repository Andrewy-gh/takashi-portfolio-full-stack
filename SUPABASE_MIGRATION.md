# Supabase Migration (Staging First)

This repo includes a Docker-based migration helper:

- `pnpm db:migrate:supabase`

It handles:

1. Dump local development DB (`DATABASE_URL`)
2. Restore into target DB (`SUPABASE_MIGRATION_DB_URL` or `--target-url`)
3. Row-count parity check for app tables: `images`, `categories`, `image_categories`, `users`

Recommended env vars:

- `SUPABASE_MIGRATION_DB_URL`: migration/restore target (Supavisor Session mode)
- `SUPABASE_RUNTIME_DB_URL`: app runtime connection (Direct preferred, Session fallback)

## Prerequisites

1. Docker running
2. `DATABASE_URL` available (already in `server/.env`)
3. Supabase migration connection string for staging

## Dry Run

```bash
pnpm db:migrate:supabase -- --dry-run --target-url "postgresql://..."
```

## Execute Migration

```bash
pnpm db:migrate:supabase -- --target-url "postgresql://..." --yes
```

Notes:

- `--yes` is required for restore (safety guard).
- Dump file is temporary by default and deleted after success.
- Use `--keep-dump` to keep it.

## Common Variants

```bash
# Use SUPABASE_MIGRATION_DB_URL from env instead of passing --target-url
pnpm db:migrate:supabase -- --yes

# Skip dump (reuse an existing dump file)
pnpm db:migrate:supabase -- --skip-dump --dump-file ".tmp/supabase-migrate/dev.dump" --yes

# Only dump, no restore
pnpm db:migrate:supabase -- --skip-restore --skip-parity
```

## Next Step After Migration

Move to auth cutover:

1. Add dual-auth backend (existing env login + Supabase JWT verification)
2. Switch dashboard login to Supabase Auth
3. Remove env-password login path after stabilization
