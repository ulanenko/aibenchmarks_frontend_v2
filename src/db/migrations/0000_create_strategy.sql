CREATE TABLE IF NOT EXISTS "bm_strategy" (
    "id" SERIAL PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "user_id" INTEGER NOT NULL REFERENCES "bm_user"("id"),
    "name" TEXT NOT NULL,
    "ideal_functional_profile" TEXT,
    "ideal_products_services" TEXT,
    "reject_functions_activities" TEXT,
    "reject_products_services" TEXT,
    "relaxed_product" BOOLEAN NOT NULL DEFAULT true,
    "relaxed_function" BOOLEAN NOT NULL DEFAULT true,
    "disabled_independence" BOOLEAN NOT NULL DEFAULT false
); 