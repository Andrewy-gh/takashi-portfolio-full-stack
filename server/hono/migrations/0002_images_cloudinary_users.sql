CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "images" RENAME COLUMN "public_id" TO "cloudinary_id";--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "sort_mode" SET DEFAULT 'custom';--> statement-breakpoint
UPDATE "categories" SET "sort_mode" = 'custom' WHERE "slug" = 'home';--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "images_cloudinary_id_idx" ON "images" USING btree ("cloudinary_id");
