CREATE TYPE "type" AS ENUM('text', 'image', 'file');--> statement-breakpoint
CREATE TABLE "drops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"code" varchar(64) NOT NULL UNIQUE,
	"type" "type" DEFAULT 'text'::"type" NOT NULL,
	"text_content" text,
	"file_key" varchar(512),
	"file_name" varchar(255),
	"file_size" integer,
	"mime_type" varchar(128),
	"views" integer DEFAULT 0 NOT NULL,
	"max_views" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() + interval '30 minutes' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "drops_user_id_idx" ON "drops" ("user_id");--> statement-breakpoint
CREATE INDEX "drops_expires_at_idx" ON "drops" ("expires_at");--> statement-breakpoint
ALTER TABLE "drops" ADD CONSTRAINT "drops_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;