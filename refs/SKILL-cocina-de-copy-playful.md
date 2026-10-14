---
name: Cocina de copy Playful
description: >-
  Use when Playful Contenido needs a piece: NEED.md + refs/, Cursor Opus writes
  pieces/. Landings need SEO checklist in refs and SEO OK before ship. Never
  Auto; never write in Grok Bot.
---
# Cocina de copy Playful

Use this whenever Playful Contenido needs a piece written: NEED.md + refs/, then Cursor Cloud Agent on Opus writes pieces/. Never Auto; never write in Grok Bot chat. For service landings, include SEO checklist in refs/ and get SEO OK before ship.

## Model (hard rule — José 6 sep 2026)

Cloud Agent launches for this kitchen **must** pass `model: opus` (Claude Opus). **Never** Auto, Composer, Sonnet, or any other model for Contenido pieces. If a run was started without Opus, stop and relaunch.

## Roles

- **Contenido:** `NEED.md` + files in `refs/`. Does not write the post. Does not brief in telegraphic chat. Does not draft in Grok Bot.
- **Cursor Cloud Agent (Opus):** reads `.cursor/skills/` (Corey first) and `refs/`, writes `pieces/YYYY-MM-DD-slug.md`.
- **SEO:** for service landings, owns on-page gate (title/H1/H2/metas/internado/FAQ schema-ready). Delivers numbered checklist into `refs/` before rewrite; OK/NO OK after draft. Does not write the piece.
- **José:** redlines (`[CAPS]` in ClickUp or in the file).
- **CEO:** keeps the kitchen, forces Opus on every launch. Does not take the pen.

## Loop

0. **Control previo (antes de escribir):** el CA copia en `refs/` los SKILL.md que aplican y escribe `refs/REFS-LEIDAS.md` (referencia → fuente). Sin eso no se redacta y nada pasa a Por firmar. Comprobar que la pieza anterior está firmada.
1. Contenido fills `NEED.md` (channel, case, one complete sentence). No post.
2. Contenido puts source files in `refs/` (Drive, evidence, quotes, competitor shells). For **landings de servicio**, SEO adds or confirms `refs/SEO-*-checklist.md` (keyword, title/H1/H2, internado, FAQ schema note).
3. CEO launches Cloud Agent on `https://github.com/playfulagency-dev/playful-copy` **with model Opus** → writes into `pieces/`.
4. Skills order: Corey first → apply SEO checklist from refs (not optional on landings) → anti-iaismos as kill list (not a dry style).
5. José redlines. Contenido applies X → Y only.
6. SEO short re-check → OK before SHIP. PARK if NO OK.

## Control previo obligatorio (14 oct 2026)

**Regla (GO José vía CEO, 14 oct 2026 11:33). Obligatoria en todo el copy (Contenido, Ventas, Propuestas, Email).**

- **Antes de redactar**, el Cloud Agent copia en `refs/` los `SKILL.md` que aplican a la pieza (como mínimo cocina, voz-web-blog, revisión de voz y las de canal/SEO que toquen).
- Escribe `refs/REFS-LEIDAS.md` listando cada referencia e investigación usada (datos, casos, citas), **cada una con su fuente** (URL o ruta).
- **Bloqueo:** si `REFS-LEIDAS.md` no existe o a alguna entrada le falta fuente, la pieza **NO pasa a Por firmar**.
- **No se inventa nada que no esté en `refs/`.**
- Después, revisión de voz (`revisi-n-de-voz-playful`).
- **Ritmo creativo:** no se escribe pieza nueva hasta que esté firmada la anterior.

### Plantilla NEED.md

```markdown
# NEED — <slug>
- Canal:
- Caso:
- Frase completa (lock):
- Pieza anterior firmada: [sí/no — enlace/ruta]

## Control previo
SKILL.md copiados en refs/: [lista]
REFS-LEIDAS.md: [sí/no]
Fuentes completas: [sí/no]
→ Si alguna es «no», la pieza no pasa a Por firmar.

## Refs
- refs/... (fuente)
```

## Prose

Complete Spanish sentences. Readable aloud. Never telegraphic three-word lines or odd passives.

## Forbidden

- Writing the piece in Grok Bot chat
- Cloud Agent on Auto (or any non-Opus model)
- Shipping a service landing without SEO OK
- `playful-headless` (that is the website)
- Inventing facts not in `refs/`
- Moving a piece to Por firmar without complete `refs/REFS-LEIDAS.md`
- Starting a new piece while the previous one is unsigned
- Printing «si facturas 100-250k» or «no es un pitch»
- Briefing Corey by restating the whole case in miniphrases
