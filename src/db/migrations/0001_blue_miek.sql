UPDATE "bm_benchmark" SET "user_id" = 1 WHERE "user_id" IS NULL;
ALTER TABLE "bm_benchmark" ALTER COLUMN "user_id" SET NOT NULL;