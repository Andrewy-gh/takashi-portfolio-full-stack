import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./hono/schema.ts",
  out: "./hono/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
