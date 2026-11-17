import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "podcast_episodios" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"titulo" varchar NOT NULL,
   	"slug" varchar NOT NULL,
   	"wp_id" numeric,
   	"estado" varchar,
   	"date" timestamp(3) with time zone,
   	"wp_date" varchar,
   	"modified_gmt" timestamp(3) with time zone,
   	"extracto" varchar,
   	"content_html" varchar,
   	"imagen_destacada_id" integer,
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

   CREATE UNIQUE INDEX "podcast_episodios_slug_idx" ON "podcast_episodios" USING btree ("slug");
   CREATE UNIQUE INDEX "podcast_episodios_wp_id_idx" ON "podcast_episodios" USING btree ("wp_id");

   CREATE TABLE "equipo" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"titulo" varchar NOT NULL,
   	"slug" varchar NOT NULL,
   	"wp_id" numeric,
   	"estado" varchar,
   	"cargo" varchar,
   	"rol" varchar,
   	"date" timestamp(3) with time zone,
   	"wp_date" varchar,
   	"modified_gmt" timestamp(3) with time zone,
   	"extracto" varchar,
   	"content_html" varchar,
   	"imagen_destacada_id" integer,
   	"acf" jsonb,
   	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
   	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE UNIQUE INDEX "equipo_slug_idx" ON "equipo" USING btree ("slug");
   CREATE UNIQUE INDEX "equipo_wp_id_idx" ON "equipo" USING btree ("wp_id");

   ALTER TABLE "podcast_episodios" ADD CONSTRAINT "podcast_episodios_imagen_destacada_id_medios_id_fk" FOREIGN KEY ("imagen_destacada_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "equipo" ADD CONSTRAINT "equipo_imagen_destacada_id_medios_id_fk" FOREIGN KEY ("imagen_destacada_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;

   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "podcast_episodios_id" integer;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_podcast_episodios_fk" FOREIGN KEY ("podcast_episodios_id") REFERENCES "public"."podcast_episodios"("id") ON DELETE cascade ON UPDATE no action;

   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "equipo_id" integer;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_equipo_fk" FOREIGN KEY ("equipo_id") REFERENCES "public"."equipo"("id") ON DELETE cascade ON UPDATE no action;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_equipo_fk";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "equipo_id";
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_podcast_episodios_fk";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "podcast_episodios_id";
   DROP TABLE "equipo" CASCADE;
   DROP TABLE "podcast_episodios" CASCADE;
  `);
}