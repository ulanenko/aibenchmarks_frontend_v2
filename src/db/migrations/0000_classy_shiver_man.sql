CREATE TABLE "bm_benchmark" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"name" text NOT NULL,
	"client_id" integer,
	"user_id" integer,
	"year" integer NOT NULL,
	"lang" text
);
--> statement-breakpoint
CREATE TABLE "bm_client" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "test" (
	"id" serial PRIMARY KEY NOT NULL,
	"test" text
);
--> statement-breakpoint
CREATE TABLE "bm_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "bm_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bm_benchmark" ADD CONSTRAINT "bm_benchmark_client_id_bm_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."bm_client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bm_benchmark" ADD CONSTRAINT "bm_benchmark_user_id_bm_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bm_user"("id") ON DELETE no action ON UPDATE no action;