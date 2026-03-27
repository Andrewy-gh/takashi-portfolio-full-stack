import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app";
import { ensureAuthBootstrap } from "./auth";

const port = Number(process.env.PORT ?? 3000);

const start = async () => {
  await ensureAuthBootstrap();
  serve({ fetch: app.fetch, port });

  // eslint-disable-next-line no-console
  console.log(`Hono server running on port ${port}`);
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
