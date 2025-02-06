DROP TYPE IF EXISTS "public"."step_status" CASCADE;
DROP TABLE IF EXISTS "bm_company" CASCADE;

CREATE TYPE "public"."step_status" AS ENUM('pending', 'in_progress', 'completed', 'failed');

CREATE TABLE "bm_company" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"benchmark_id" integer NOT NULL,
	"database_id" text,
	"country" text,
	"url" text,
	"street_and_number" text,
	"address_line_1" text,
	"consolidation_code" text,
	"independence_indicator" text,
	"nace_rev_2" text,
	"full_overview" text,
	"full_overview_manual" text,
	"trade_description_english" text,
	"trade_description_original" text,
	"main_activity" text,
	"main_products_and_services" text,
	"source_data" json,
	"mapped_source_data" json,
	"data_status" "step_status"
);

ALTER TABLE "bm_company" ADD CONSTRAINT "bm_company_benchmark_id_bm_benchmark_id_fk" FOREIGN KEY ("benchmark_id") REFERENCES "public"."bm_benchmark"("id") ON DELETE cascade ON UPDATE no action;