CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"sort_mode" text DEFAULT 'created_at_desc' NOT NULL,
	"sequence" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_categories" (
	"image_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"position" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "image_categories_image_id_category_id_pk" PRIMARY KEY("image_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "image_categories" ADD CONSTRAINT "image_categories_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_categories" ADD CONSTRAINT "image_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_idx" ON "categories" USING btree ("name");--> statement-breakpoint
INSERT INTO "categories" ("name", "slug", "sort_mode")
VALUES ('Home', 'home', 'created_at_desc')
ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
INSERT INTO "image_categories" ("image_id", "category_id")
SELECT images.id, categories.id
FROM "images"
JOIN "categories" ON categories.slug = 'home'
ON CONFLICT DO NOTHING;--> statement-breakpoint
CREATE UNIQUE INDEX "image_categories_category_position_idx" ON "image_categories" USING btree ("category_id","position");--> statement-breakpoint
CREATE INDEX "image_categories_category_image_idx" ON "image_categories" USING btree ("category_id","image_id");
