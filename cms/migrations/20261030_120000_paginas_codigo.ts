import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "paginas_codigo" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"titulo" varchar NOT NULL,
   	"slug" varchar NOT NULL,
   	"bloque" varchar NOT NULL,
   	"content" jsonb NOT NULL,
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

   CREATE UNIQUE INDEX "paginas_codigo_slug_idx" ON "paginas_codigo" USING btree ("slug");
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "paginas_codigo_id" integer;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paginas_codigo_fk" FOREIGN KEY ("paginas_codigo_id") REFERENCES "public"."paginas_codigo"("id") ON DELETE cascade ON UPDATE no action;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_paginas_codigo_fk";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "paginas_codigo_id";
   DROP TABLE "paginas_codigo" CASCADE;
  `);
}
