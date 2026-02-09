# Agent Notes

Client refactor ideas (vercel composition patterns):
- architecture-compound-components + state-lift-state: replace `ButtonDialog` + `useDialog` with `Dialog.Root/Trigger/Content` so `open/handleOpen/handleClose/buttonText/variant` props disappear.
- patterns-explicit-variants: `ImageUpload`, `EditButton`, `DeleteButton` -> explicit dialog variants composing the shared Dialog pieces.
- architecture-avoid-boolean-props + patterns-explicit-variants: split `Images` into `ImagesGrid` + `Images.Loading/Error/Empty` (or `ImagesState`) instead of `isLoading/error` booleans.
- state-context-interface + state-decouple-implementation: reshape `AuthContext`/`NotificationContext` to `{ state, actions, meta }` so providers own state, consumers use actions.
- architecture-compound-components: extract shared menu item rendering into `Menu.List`/`Menu.Item` with context to remove duplicate logic in `MenuDesktop` and `DrawerMenu`.

Image asset locations (Cloudinary):
- Full-size: `C:\E\2026\unsplash-downloader\photos`
- Small: `C:\E\2026\unsplash-downloader\photos_small`
- Alt text: `C:\E\2026\unsplash-downloader\photos\alt-text.json`
- 25MP backup: `C:\E\2026\unsplash-downloader\photos_25mp`

Local upload dev reminder:
- Decide: named Cloudflare tunnel (stable URL) vs quick tunnel (new URL each run).
- If no named tunnel: add `pnpm dev:upload` script to start tunnel, parse URL, set `CLOUDINARY_NOTIFICATION_URL`, start server, and print health check.

Cloudinary free-tier + seed prep check (2026-02-08):
- Plan model (not re-verified online; confirm in Cloudinary dashboard): `Free` includes `25` monthly credits; hard caps include `10MB` max image upload size and `25MP` max image megapixels.
- Current local source (relative): `..\unsplash-downloader\photos` and `..\unsplash-downloader\photos_small` (resolved to `C:\E\projects\unsplash-downloader\...`).
- `photos`: `241` JPG (+`3` JSON state files), total `~782MB`, max file `8.5MB`, max `~25MP`, `0` files over `25MP`.
- `photos_small`: `241` JPG (+`1` JSON), total `~23.4MB`, max file `0.28MB`, max `~0.84MP`.
- Seed recommendation: upload `photos` originals (skip `*.json`) and use Cloudinary transformations for thumbs; fallback low-risk: seed from `photos_small` first to minimize storage/bandwidth while wiring DB + URLs.

## Handoff (2026-02-09)

Left off:
- `main` ahead of `origin/main` by 8 commits. Gate clean: `pnpm lint`, `pnpm typecheck`.
- Dashboard auth UX:
  - Sign-out redirects to `/sign-in`.
  - Friendly auth errors (no raw JSON); toast on sign-in failure.
  - Dashboard API calls now attach `Authorization: Bearer <token>` automatically.
- Upload flow:
  - Upload UI now includes Category picker.
  - Upload now inserts/updates DB immediately via `POST /api/images/from-cloudinary` (no Cloudinary webhook dependency in local dev), with fallback to webhook wait.
- Category delete behavior:
  - Deleting a category now ensures affected images remain in `Home` (server-side).
  - Delete dialog copy updated to match behavior.
  - Category name max now 80 chars (UI + API); description max 256 (API).
- Dashboard `/categories`:
  - Added sort toggle: Created (Newest/Oldest).
- Tests:
  - Updated e2e to create categories via token (routes now require admin).
  - Added e2e regression: delete category keeps image in Home.
  - E2E currently skips unless env set (`AUTH_EMAIL`/`AUTH_PASSWORD` + `API_SECRET`).

Note:
- Image question: `Huzz Alt Tech Smoke 1770590791313` corresponds to DB row titled `Smoke 1770590791313` (Cloudinary `smoke/1770590791313-b120eea81f6ab`).

Next:
1. Push branch + open PR.
2. Manual test upload end-to-end:
   - Upload -> confirm appears in `/images` without webhook.
   - Upload with Category selected -> confirm appears under that category and still in Home.
3. Decide product behavior:
   - Category name validation rules (case-insensitive dupes? max length OK?).
4. Remaining feature requests from testing:
   - UI: choose an image as Category thumbnail.
   - Client/public site `/categories` sorting (if this request was for client, not dashboard).
