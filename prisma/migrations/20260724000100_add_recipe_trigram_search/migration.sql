CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "recipes_title_trgm_idx"
  ON "recipes" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "recipes_description_trgm_idx"
  ON "recipes" USING GIN ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "recipes_tips_trgm_idx"
  ON "recipes" USING GIN ("tips" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "recipes_substitutions_trgm_idx"
  ON "recipes" USING GIN ("substitutions" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "ingredients_name_trgm_idx"
  ON "ingredients" USING GIN ("name" gin_trgm_ops);