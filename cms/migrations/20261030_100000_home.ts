import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"slug" varchar NOT NULL,
   	"content" jsonb NOT NULL,
   	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
   	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE UNIQUE INDEX "home_slug_idx" ON "home" USING btree ("slug");
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "home_id" integer;
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_home_fk" FOREIGN KEY ("home_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_home_fk";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "home_id";
   DROP TABLE "home" CASCADE;
  `);
}
