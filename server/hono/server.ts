import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app";

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port });

// eslint-disable-next-line no-console
console.log(`Hono server running on port ${port}`);
