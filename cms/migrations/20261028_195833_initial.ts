import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "posts_imagenes_contenido" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"src" varchar,
  	"alt" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"wp_id" numeric,
  	"estado" varchar,
  	"categoria_id" integer,
  	"autor_id" integer,
  	"date" timestamp(3) with time zone,
  	"wp_date" varchar,
  	"modified_gmt" timestamp(3) with time zone,
  	"extracto" varchar,
  	"content_html" varchar,
  	"imagen_destacada_id" integer,
  	"articulos_relacionados_wp_ids" jsonb,
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
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categorias_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "paginas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"wp_id" numeric,
  	"estado" varchar,
  	"parent_wp_id" numeric,
  	"link" varchar,
  	"plantilla" varchar,
  	"date" timestamp(3) with time zone,
  	"wp_date" varchar,
  	"modified_gmt" timestamp(3) with time zone,
  	"content_html" varchar,
  	"imagen_destacada_id" integer,
  	"acf" jsonb,
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
  
  CREATE TABLE "casos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"wp_id" numeric,
  	"estado" varchar,
  	"date" timestamp(3) with time zone,
  	"wp_date" varchar,
  	"modified_gmt" timestamp(3) with time zone,
  	"content_html" varchar,
  	"imagen_destacada_id" integer,
  	"acf_categoria1" varchar,
  	"acf_categoria2" varchar,
  	"acf_categoria3" varchar,
  	"acf_categoria4" varchar,
  	"acf_categoria5" varchar,
  	"acf_h1" varchar,
  	"acf_primerap" varchar,
  	"acf_imagenbanner_id" integer,
  	"acf_primerh2" varchar,
  	"acf_segundap" varchar,
  	"acf_imagenminuta1_id" integer,
  	"acf_imagenminuta2_id" integer,
  	"acf_imagenminuta3_id" integer,
  	"acf_segundoh2" varchar,
  	"acf_tercerap" varchar,
  	"acf_cuartap" varchar,
  	"acf_quintap" varchar,
  	"acf_sextap" varchar,
  	"acf_septimap" varchar,
  	"acf_octavap" varchar,
  	"acf_novenap" varchar,
  	"acf_desafioimagen1_id" integer,
  	"acf_desafioimagen2_id" integer,
  	"acf_desafioimagen3_id" integer,
  	"acf_desafioimagen4_id" integer,
  	"acf_tercerh2" varchar,
  	"acf_decima" varchar,
  	"acf_otroh2st" varchar,
  	"acf_otropst" varchar,
  	"acf_imagendesarrollo_id" integer,
  	"acf_imagenminuta4_id" integer,
  	"acf_imagenminuta5_id" integer,
  	"acf_imagenminuta6_id" integer,
  	"acf_primerah3desarrollo" varchar,
  	"acf_primerapdesarrollo" varchar,
  	"acf_segundah3desarrollo" varchar,
  	"acf_segundapdesarrollo" varchar,
  	"acf_tercerh3desarrollo" varchar,
  	"acf_tercerapdesarrollo" varchar,
  	"acf_grilla1_id" integer,
  	"acf_grilla2_id" integer,
  	"acf_grilla3_id" integer,
  	"acf_grilla4_id" integer,
  	"acf_grilla5_id" integer,
  	"acf_grilla6_id" integer,
  	"acf_grilla7_id" integer,
  	"acf_grilla8_id" integer,
  	"acf_resultadotitulo" varchar,
  	"acf_resultadodescripcion" varchar,
  	"acf_resultado1" varchar,
  	"acf_resultadop1" varchar,
  	"acf_resultado2" varchar,
  	"acf_resultadop2" varchar,
  	"acf_resultado3" varchar,
  	"acf_resultadop3" varchar,
  	"acf_telefono1_id" integer,
  	"acf_telefono2_id" integer,
  	"acf_telefono3_id" integer,
  	"acf_telefono4_id" integer,
  	"acf_telefonos_id" integer,
  	"acf_testimonialnombre" varchar,
  	"acf_testimonialcargo" varchar,
  	"acf_testimonio" varchar,
  	"acf_testimonial_foto_id" integer,
  	"acf_soytechno" jsonb,
  	"acf_template" varchar,
  	"acf_mostrar_cta_final_mostrar_cta" boolean,
  	"acf_mostrar_cta_final_titulo_del_cta" varchar,
  	"acf_mostrar_cta_final_descripcion" varchar,
  	"acf_mostrar_cta_final_titulo2" varchar,
  	"acf_mostrar_cta_final_parrafo2" varchar,
  	"url_video" varchar,
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
  
  CREATE TABLE "autores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"wp_id" numeric,
  	"nombre" varchar NOT NULL,
  	"slug" varchar,
  	"descripcion" varchar,
  	"url" varchar,
  	"avatar_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"wp_id" numeric,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"descripcion" varchar,
  	"parent_wp_id" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "medios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"wp_id" numeric,
  	"alt" varchar,
  	"titulo" varchar,
  	"caption" varchar,
  	"source_url" varchar,
  	"wp_mime_type" varchar,
  	"wp_width" numeric,
  	"wp_height" numeric,
  	"wp_sizes" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "usuarios_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "usuarios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"paginas_id" integer,
  	"casos_id" integer,
  	"autores_id" integer,
  	"categorias_id" integer,
  	"medios_id" integer,
  	"usuarios_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"usuarios_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "posts_imagenes_contenido" ADD CONSTRAINT "posts_imagenes_contenido_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_imagen_destacada_id_medios_id_fk" FOREIGN KEY ("imagen_destacada_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas" ADD CONSTRAINT "paginas_imagen_destacada_id_medios_id_fk" FOREIGN KEY ("imagen_destacada_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_imagen_destacada_id_medios_id_fk" FOREIGN KEY ("imagen_destacada_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_imagenbanner_id_medios_id_fk" FOREIGN KEY ("acf_imagenbanner_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_imagenminuta1_id_medios_id_fk" FOREIGN KEY ("acf_imagenminuta1_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_imagenminuta2_id_medios_id_fk" FOREIGN KEY ("acf_imagenminuta2_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_imagenminuta3_id_medios_id_fk" FOREIGN KEY ("acf_imagenminuta3_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_desafioimagen1_id_medios_id_fk" FOREIGN KEY ("acf_desafioimagen1_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_desafioimagen2_id_medios_id_fk" FOREIGN KEY ("acf_desafioimagen2_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_desafioimagen3_id_medios_id_fk" FOREIGN KEY ("acf_desafioimagen3_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_desafioimagen4_id_medios_id_fk" FOREIGN KEY ("acf_desafioimagen4_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_imagendesarrollo_id_medios_id_fk" FOREIGN KEY ("acf_imagendesarrollo_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_imagenminuta4_id_medios_id_fk" FOREIGN KEY ("acf_imagenminuta4_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_imagenminuta5_id_medios_id_fk" FOREIGN KEY ("acf_imagenminuta5_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_imagenminuta6_id_medios_id_fk" FOREIGN KEY ("acf_imagenminuta6_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_grilla1_id_medios_id_fk" FOREIGN KEY ("acf_grilla1_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_grilla2_id_medios_id_fk" FOREIGN KEY ("acf_grilla2_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_grilla3_id_medios_id_fk" FOREIGN KEY ("acf_grilla3_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_grilla4_id_medios_id_fk" FOREIGN KEY ("acf_grilla4_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_grilla5_id_medios_id_fk" FOREIGN KEY ("acf_grilla5_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_grilla6_id_medios_id_fk" FOREIGN KEY ("acf_grilla6_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_grilla7_id_medios_id_fk" FOREIGN KEY ("acf_grilla7_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_grilla8_id_medios_id_fk" FOREIGN KEY ("acf_grilla8_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_telefono1_id_medios_id_fk" FOREIGN KEY ("acf_telefono1_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_telefono2_id_medios_id_fk" FOREIGN KEY ("acf_telefono2_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_telefono3_id_medios_id_fk" FOREIGN KEY ("acf_telefono3_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_telefono4_id_medios_id_fk" FOREIGN KEY ("acf_telefono4_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_telefonos_id_medios_id_fk" FOREIGN KEY ("acf_telefonos_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "casos" ADD CONSTRAINT "casos_acf_testimonial_foto_id_medios_id_fk" FOREIGN KEY ("acf_testimonial_foto_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "usuarios_sessions" ADD CONSTRAINT "usuarios_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paginas_fk" FOREIGN KEY ("paginas_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_casos_fk" FOREIGN KEY ("casos_id") REFERENCES "public"."casos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_autores_fk" FOREIGN KEY ("autores_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_medios_fk" FOREIGN KEY ("medios_id") REFERENCES "public"."medios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_imagenes_contenido_order_idx" ON "posts_imagenes_contenido" USING btree ("_order");
  CREATE INDEX "posts_imagenes_contenido_parent_id_idx" ON "posts_imagenes_contenido" USING btree ("_parent_id");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE UNIQUE INDEX "posts_wp_id_idx" ON "posts" USING btree ("wp_id");
  CREATE INDEX "posts_categoria_idx" ON "posts" USING btree ("categoria_id");
  CREATE INDEX "posts_autor_idx" ON "posts" USING btree ("autor_id");
  CREATE INDEX "posts_imagen_destacada_idx" ON "posts" USING btree ("imagen_destacada_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_categorias_id_idx" ON "posts_rels" USING btree ("categorias_id");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "paginas_slug_idx" ON "paginas" USING btree ("slug");
  CREATE UNIQUE INDEX "paginas_wp_id_idx" ON "paginas" USING btree ("wp_id");
  CREATE INDEX "paginas_imagen_destacada_idx" ON "paginas" USING btree ("imagen_destacada_id");
  CREATE INDEX "paginas_updated_at_idx" ON "paginas" USING btree ("updated_at");
  CREATE INDEX "paginas_created_at_idx" ON "paginas" USING btree ("created_at");
  CREATE INDEX "casos_slug_idx" ON "casos" USING btree ("slug");
  CREATE UNIQUE INDEX "casos_wp_id_idx" ON "casos" USING btree ("wp_id");
  CREATE INDEX "casos_imagen_destacada_idx" ON "casos" USING btree ("imagen_destacada_id");
  CREATE INDEX "casos_acf_acf_imagenbanner_idx" ON "casos" USING btree ("acf_imagenbanner_id");
  CREATE INDEX "casos_acf_acf_imagenminuta1_idx" ON "casos" USING btree ("acf_imagenminuta1_id");
  CREATE INDEX "casos_acf_acf_imagenminuta2_idx" ON "casos" USING btree ("acf_imagenminuta2_id");
  CREATE INDEX "casos_acf_acf_imagenminuta3_idx" ON "casos" USING btree ("acf_imagenminuta3_id");
  CREATE INDEX "casos_acf_acf_desafioimagen1_idx" ON "casos" USING btree ("acf_desafioimagen1_id");
  CREATE INDEX "casos_acf_acf_desafioimagen2_idx" ON "casos" USING btree ("acf_desafioimagen2_id");
  CREATE INDEX "casos_acf_acf_desafioimagen3_idx" ON "casos" USING btree ("acf_desafioimagen3_id");
  CREATE INDEX "casos_acf_acf_desafioimagen4_idx" ON "casos" USING btree ("acf_desafioimagen4_id");
  CREATE INDEX "casos_acf_acf_imagendesarrollo_idx" ON "casos" USING btree ("acf_imagendesarrollo_id");
  CREATE INDEX "casos_acf_acf_imagenminuta4_idx" ON "casos" USING btree ("acf_imagenminuta4_id");
  CREATE INDEX "casos_acf_acf_imagenminuta5_idx" ON "casos" USING btree ("acf_imagenminuta5_id");
  CREATE INDEX "casos_acf_acf_imagenminuta6_idx" ON "casos" USING btree ("acf_imagenminuta6_id");
  CREATE INDEX "casos_acf_acf_grilla1_idx" ON "casos" USING btree ("acf_grilla1_id");
  CREATE INDEX "casos_acf_acf_grilla2_idx" ON "casos" USING btree ("acf_grilla2_id");
  CREATE INDEX "casos_acf_acf_grilla3_idx" ON "casos" USING btree ("acf_grilla3_id");
  CREATE INDEX "casos_acf_acf_grilla4_idx" ON "casos" USING btree ("acf_grilla4_id");
  CREATE INDEX "casos_acf_acf_grilla5_idx" ON "casos" USING btree ("acf_grilla5_id");
  CREATE INDEX "casos_acf_acf_grilla6_idx" ON "casos" USING btree ("acf_grilla6_id");
  CREATE INDEX "casos_acf_acf_grilla7_idx" ON "casos" USING btree ("acf_grilla7_id");
  CREATE INDEX "casos_acf_acf_grilla8_idx" ON "casos" USING btree ("acf_grilla8_id");
  CREATE INDEX "casos_acf_acf_telefono1_idx" ON "casos" USING btree ("acf_telefono1_id");
  CREATE INDEX "casos_acf_acf_telefono2_idx" ON "casos" USING btree ("acf_telefono2_id");
  CREATE INDEX "casos_acf_acf_telefono3_idx" ON "casos" USING btree ("acf_telefono3_id");
  CREATE INDEX "casos_acf_acf_telefono4_idx" ON "casos" USING btree ("acf_telefono4_id");
  CREATE INDEX "casos_acf_acf_telefonos_idx" ON "casos" USING btree ("acf_telefonos_id");
  CREATE INDEX "casos_acf_acf_testimonial_foto_idx" ON "casos" USING btree ("acf_testimonial_foto_id");
  CREATE INDEX "casos_updated_at_idx" ON "casos" USING btree ("updated_at");
  CREATE INDEX "casos_created_at_idx" ON "casos" USING btree ("created_at");
  CREATE UNIQUE INDEX "autores_wp_id_idx" ON "autores" USING btree ("wp_id");
  CREATE INDEX "autores_slug_idx" ON "autores" USING btree ("slug");
  CREATE INDEX "autores_updated_at_idx" ON "autores" USING btree ("updated_at");
  CREATE INDEX "autores_created_at_idx" ON "autores" USING btree ("created_at");
  CREATE UNIQUE INDEX "categorias_wp_id_idx" ON "categorias" USING btree ("wp_id");
  CREATE UNIQUE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE UNIQUE INDEX "medios_wp_id_idx" ON "medios" USING btree ("wp_id");
  CREATE INDEX "medios_source_url_idx" ON "medios" USING btree ("source_url");
  CREATE INDEX "medios_updated_at_idx" ON "medios" USING btree ("updated_at");
  CREATE INDEX "medios_created_at_idx" ON "medios" USING btree ("created_at");
  CREATE UNIQUE INDEX "medios_filename_idx" ON "medios" USING btree ("filename");
  CREATE INDEX "usuarios_sessions_order_idx" ON "usuarios_sessions" USING btree ("_order");
  CREATE INDEX "usuarios_sessions_parent_id_idx" ON "usuarios_sessions" USING btree ("_parent_id");
  CREATE INDEX "usuarios_updated_at_idx" ON "usuarios" USING btree ("updated_at");
  CREATE INDEX "usuarios_created_at_idx" ON "usuarios" USING btree ("created_at");
  CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_paginas_id_idx" ON "payload_locked_documents_rels" USING btree ("paginas_id");
  CREATE INDEX "payload_locked_documents_rels_casos_id_idx" ON "payload_locked_documents_rels" USING btree ("casos_id");
  CREATE INDEX "payload_locked_documents_rels_autores_id_idx" ON "payload_locked_documents_rels" USING btree ("autores_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");
  CREATE INDEX "payload_locked_documents_rels_medios_id_idx" ON "payload_locked_documents_rels" USING btree ("medios_id");
  CREATE INDEX "payload_locked_documents_rels_usuarios_id_idx" ON "payload_locked_documents_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_usuarios_id_idx" ON "payload_preferences_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "posts_imagenes_contenido" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "paginas" CASCADE;
  DROP TABLE "casos" CASCADE;
  DROP TABLE "autores" CASCADE;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "medios" CASCADE;
  DROP TABLE "usuarios_sessions" CASCADE;
  DROP TABLE "usuarios" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;`)
}
