import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const images = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").notNull(),
  url: text("url").notNull(),
  title: text("title"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    sortMode: text("sort_mode").notNull().default("created_at_desc"),
    sequence: integer("sequence"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(table.slug),
    nameIdx: uniqueIndex("categories_name_idx").on(table.name),
  })
);

export const imageCategories = pgTable(
  "image_categories",
  {
    imageId: uuid("image_id")
      .notNull()
      .references(() => images.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    position: integer("position"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.imageId, table.categoryId] }),
    categoryPositionIdx: uniqueIndex(
      "image_categories_category_position_idx"
    ).on(table.categoryId, table.position),
    categoryImageIdx: index("image_categories_category_image_idx").on(
      table.categoryId,
      table.imageId
    ),
  })
);
