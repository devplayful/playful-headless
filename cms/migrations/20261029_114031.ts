import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_servicios_blocks_texto_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_servicios_blocks_tarjetas_items_card_color" AS ENUM('purple', 'yellow', 'mint', 'pink', 'none');
  CREATE TYPE "public"."enum_servicios_blocks_cima_breaker_variant" AS ENUM('shopify', 'ecommerce');
  CREATE TYPE "public"."enum_servicios_blocks_modulo_extra_kind" AS ENUM('testimonials', 'relatedBlog');
  CREATE TABLE "servicios_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"h1" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"subline" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"contact_link_label" varchar,
  	"contact_link_href" varchar,
  	"illustration_slot" varchar,
  	"image_url1x" varchar,
  	"image_url2x" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios_blocks_texto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"h2" varchar,
  	"body" varchar NOT NULL,
  	"align" "enum_servicios_blocks_texto_align" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios_blocks_ventajas_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lead" varchar,
  	"title" varchar,
  	"body" varchar NOT NULL,
  	"image_url" varchar
  );
  
  CREATE TABLE "servicios_blocks_ventajas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"h2" varchar,
  	"intro" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios_blocks_tarjetas_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"illustration_slot" varchar,
  	"image_url" varchar,
  	"card_color" "enum_servicios_blocks_tarjetas_items_card_color" DEFAULT 'none'
  );
  
  CREATE TABLE "servicios_blocks_tarjetas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"h2" varchar,
  	"intro" varchar,
  	"extra_paragraph" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios_blocks_banda_morada" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"h2" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios_blocks_logos_casos_case_slugs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL
  );
  
  CREATE TABLE "servicios_blocks_logos_casos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"h2" varchar,
  	"quote" varchar,
  	"attribution" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "servicios_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"h2" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"h2" varchar NOT NULL,
  	"body" varchar,
  	"question" varchar,
  	"button_label" varchar NOT NULL,
  	"button_href" varchar NOT NULL,
  	"image_url" varchar,
  	"content_bg_color" varchar DEFAULT '#B3FFF3',
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios_blocks_elementor" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_id" numeric NOT NULL,
  	"html" varchar NOT NULL,
  	"stylesheet_ids" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios_blocks_cima_breaker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_servicios_blocks_cima_breaker_variant" DEFAULT 'shopify' NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios_blocks_modulo_extra" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_servicios_blocks_modulo_extra_kind" NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "servicios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"wp_id" numeric,
  	"h1" varchar,
  	"estado" varchar DEFAULT 'publish',
  	"date" timestamp(3) with time zone,
  	"wp_date" varchar,
  	"modified_gmt" timestamp(3) with time zone,
  	"yoast_title" varchar,
  	"yoast_description" varchar,
  	"yoast_canonical" varchar,
  	"yoast_robots" jsonb,
  	"yoast_og_image" varchar,
  	"yoast_og_title" varchar,
  	"yoast_og_description" varchar,
  	"yoast_schema" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "servicios_id" integer;
  ALTER TABLE "servicios_blocks_hero" ADD CONSTRAINT "servicios_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_texto" ADD CONSTRAINT "servicios_blocks_texto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_ventajas_items" ADD CONSTRAINT "servicios_blocks_ventajas_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios_blocks_ventajas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_ventajas" ADD CONSTRAINT "servicios_blocks_ventajas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_tarjetas_items" ADD CONSTRAINT "servicios_blocks_tarjetas_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios_blocks_tarjetas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_tarjetas" ADD CONSTRAINT "servicios_blocks_tarjetas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_banda_morada" ADD CONSTRAINT "servicios_blocks_banda_morada_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_logos_casos_case_slugs" ADD CONSTRAINT "servicios_blocks_logos_casos_case_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios_blocks_logos_casos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_logos_casos" ADD CONSTRAINT "servicios_blocks_logos_casos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_faq_items" ADD CONSTRAINT "servicios_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_faq" ADD CONSTRAINT "servicios_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_cta" ADD CONSTRAINT "servicios_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_elementor" ADD CONSTRAINT "servicios_blocks_elementor_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_cima_breaker" ADD CONSTRAINT "servicios_blocks_cima_breaker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "servicios_blocks_modulo_extra" ADD CONSTRAINT "servicios_blocks_modulo_extra_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "servicios_blocks_hero_order_idx" ON "servicios_blocks_hero" USING btree ("_order");
  CREATE INDEX "servicios_blocks_hero_parent_id_idx" ON "servicios_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_hero_path_idx" ON "servicios_blocks_hero" USING btree ("_path");
  CREATE INDEX "servicios_blocks_texto_order_idx" ON "servicios_blocks_texto" USING btree ("_order");
  CREATE INDEX "servicios_blocks_texto_parent_id_idx" ON "servicios_blocks_texto" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_texto_path_idx" ON "servicios_blocks_texto" USING btree ("_path");
  CREATE INDEX "servicios_blocks_ventajas_items_order_idx" ON "servicios_blocks_ventajas_items" USING btree ("_order");
  CREATE INDEX "servicios_blocks_ventajas_items_parent_id_idx" ON "servicios_blocks_ventajas_items" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_ventajas_order_idx" ON "servicios_blocks_ventajas" USING btree ("_order");
  CREATE INDEX "servicios_blocks_ventajas_parent_id_idx" ON "servicios_blocks_ventajas" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_ventajas_path_idx" ON "servicios_blocks_ventajas" USING btree ("_path");
  CREATE INDEX "servicios_blocks_tarjetas_items_order_idx" ON "servicios_blocks_tarjetas_items" USING btree ("_order");
  CREATE INDEX "servicios_blocks_tarjetas_items_parent_id_idx" ON "servicios_blocks_tarjetas_items" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_tarjetas_order_idx" ON "servicios_blocks_tarjetas" USING btree ("_order");
  CREATE INDEX "servicios_blocks_tarjetas_parent_id_idx" ON "servicios_blocks_tarjetas" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_tarjetas_path_idx" ON "servicios_blocks_tarjetas" USING btree ("_path");
  CREATE INDEX "servicios_blocks_banda_morada_order_idx" ON "servicios_blocks_banda_morada" USING btree ("_order");
  CREATE INDEX "servicios_blocks_banda_morada_parent_id_idx" ON "servicios_blocks_banda_morada" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_banda_morada_path_idx" ON "servicios_blocks_banda_morada" USING btree ("_path");
  CREATE INDEX "servicios_blocks_logos_casos_case_slugs_order_idx" ON "servicios_blocks_logos_casos_case_slugs" USING btree ("_order");
  CREATE INDEX "servicios_blocks_logos_casos_case_slugs_parent_id_idx" ON "servicios_blocks_logos_casos_case_slugs" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_logos_casos_order_idx" ON "servicios_blocks_logos_casos" USING btree ("_order");
  CREATE INDEX "servicios_blocks_logos_casos_parent_id_idx" ON "servicios_blocks_logos_casos" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_logos_casos_path_idx" ON "servicios_blocks_logos_casos" USING btree ("_path");
  CREATE INDEX "servicios_blocks_faq_items_order_idx" ON "servicios_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "servicios_blocks_faq_items_parent_id_idx" ON "servicios_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_faq_order_idx" ON "servicios_blocks_faq" USING btree ("_order");
  CREATE INDEX "servicios_blocks_faq_parent_id_idx" ON "servicios_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_faq_path_idx" ON "servicios_blocks_faq" USING btree ("_path");
  CREATE INDEX "servicios_blocks_cta_order_idx" ON "servicios_blocks_cta" USING btree ("_order");
  CREATE INDEX "servicios_blocks_cta_parent_id_idx" ON "servicios_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_cta_path_idx" ON "servicios_blocks_cta" USING btree ("_path");
  CREATE INDEX "servicios_blocks_elementor_order_idx" ON "servicios_blocks_elementor" USING btree ("_order");
  CREATE INDEX "servicios_blocks_elementor_parent_id_idx" ON "servicios_blocks_elementor" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_elementor_path_idx" ON "servicios_blocks_elementor" USING btree ("_path");
  CREATE INDEX "servicios_blocks_cima_breaker_order_idx" ON "servicios_blocks_cima_breaker" USING btree ("_order");
  CREATE INDEX "servicios_blocks_cima_breaker_parent_id_idx" ON "servicios_blocks_cima_breaker" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_cima_breaker_path_idx" ON "servicios_blocks_cima_breaker" USING btree ("_path");
  CREATE INDEX "servicios_blocks_modulo_extra_order_idx" ON "servicios_blocks_modulo_extra" USING btree ("_order");
  CREATE INDEX "servicios_blocks_modulo_extra_parent_id_idx" ON "servicios_blocks_modulo_extra" USING btree ("_parent_id");
  CREATE INDEX "servicios_blocks_modulo_extra_path_idx" ON "servicios_blocks_modulo_extra" USING btree ("_path");
  CREATE INDEX "servicios_slug_idx" ON "servicios" USING btree ("slug");
  CREATE UNIQUE INDEX "servicios_wp_id_idx" ON "servicios" USING btree ("wp_id");
  CREATE INDEX "servicios_updated_at_idx" ON "servicios" USING btree ("updated_at");
  CREATE INDEX "servicios_created_at_idx" ON "servicios" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_servicios_fk" FOREIGN KEY ("servicios_id") REFERENCES "public"."servicios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_servicios_id_idx" ON "payload_locked_documents_rels" USING btree ("servicios_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "servicios_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_texto" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_ventajas_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_ventajas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_tarjetas_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_tarjetas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_banda_morada" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_logos_casos_case_slugs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_logos_casos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_elementor" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_cima_breaker" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios_blocks_modulo_extra" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "servicios" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "servicios_blocks_hero" CASCADE;
  DROP TABLE "servicios_blocks_texto" CASCADE;
  DROP TABLE "servicios_blocks_ventajas_items" CASCADE;
  DROP TABLE "servicios_blocks_ventajas" CASCADE;
  DROP TABLE "servicios_blocks_tarjetas_items" CASCADE;
  DROP TABLE "servicios_blocks_tarjetas" CASCADE;
  DROP TABLE "servicios_blocks_banda_morada" CASCADE;
  DROP TABLE "servicios_blocks_logos_casos_case_slugs" CASCADE;
  DROP TABLE "servicios_blocks_logos_casos" CASCADE;
  DROP TABLE "servicios_blocks_faq_items" CASCADE;
  DROP TABLE "servicios_blocks_faq" CASCADE;
  DROP TABLE "servicios_blocks_cta" CASCADE;
  DROP TABLE "servicios_blocks_elementor" CASCADE;
  DROP TABLE "servicios_blocks_cima_breaker" CASCADE;
  DROP TABLE "servicios_blocks_modulo_extra" CASCADE;
  DROP TABLE "servicios" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_servicios_fk";
  
  DROP INDEX "payload_locked_documents_rels_servicios_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "servicios_id";
  DROP TYPE "public"."enum_servicios_blocks_texto_align";
  DROP TYPE "public"."enum_servicios_blocks_tarjetas_items_card_color";
  DROP TYPE "public"."enum_servicios_blocks_cima_breaker_variant";
  DROP TYPE "public"."enum_servicios_blocks_modulo_extra_kind";`)
}
