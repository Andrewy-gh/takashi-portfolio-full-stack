import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const images = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").notNull(),
  url: text("url").notNull(),
  title: text("title"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
