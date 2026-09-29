# Staging fijo — playfulagency.com

URL fija de staging (alias de rama Vercel):

`https://playful-headless-git-staging-playfuls-projects.vercel.app`

Esta rama (`staging`) es el entorno de previsualización compartido. **No es producción.** No se mergea entera a `main`. Producción sigue siendo `main` → `playfulagency.com`.

## Flujo por cambio

1. **Cada cambio va en su propia rama** `cursor/...` o `feat/...` creada desde `main` (nunca desde `staging`).
2. **Se abre un PR con base `staging`.** El equipo lo mergea libremente con **merge commit** (no squash) para verlo en la URL fija de staging.
3. **Card ClickUp obligatoria (regla de José, 29 sep 15:09).** Todo lo que se publica en staging lleva su card en estado **«En staging»** con:
   - Enlace directo: preview del PR (comentario del bot de Vercel) **y** URL fija de staging + ruta de la página (ej. `https://playful-headless-git-staging-playfuls-projects.vercel.app/blog`).
   - Qué cambió.
   - Quién lo hizo.
   - Hora (Europe/Madrid).
   **Sin card no cuenta como publicado.**
4. **Paso a producción:** sale de ese estado **«En staging»** con GO de José o Alejandra. Entonces se abre un PR de **esa misma rama de feature contra `main`** (no `staging` → `main` entero). Merge con **squash**. Así se promueve cambio por cambio.
5. **Resync:** tras cada merge a `main`, `main` se mergea en `staging`. Si staging se ensucia, se resetea a `main` (avisando al equipo antes).

## Qué no hacer

- No abrir un PR `staging` → `main` que lleve todo el entorno de una vez.
- No hacer squash al mergear features en `staging` (dificulta el resync y el rastro por cambio).
- No commitear a `main` ni a `staging` salvo el resync (`main` → `staging`) o un reset anunciado.
- No tocar settings de Vercel, DNS ni variables de entorno para “activar” staging: el alias de rama basta.

## Resync y reset

Tras un squash-merge a `main`:

```bash
git fetch origin
git checkout staging
git merge origin/main
git push origin staging
```

Si `staging` diverge o se ensucia (conflictos irrecuperables, commits sueltos, experimentación rota):

1. Avisar al equipo (staging se va a igualar a `main`; las previews de PRs abiertos contra `staging` pueden requerir rebase).
2. Reset anunciado:

```bash
git fetch origin
git checkout staging
git reset --hard origin/main
git push --force-with-lease origin staging
```

## Cómo deshacer un cambio

Cada cambio tiene que poder deshacerse, en staging y en producción (regla de José, 29 sep 15:30).

### Staging

El alias fijo (`playful-headless-git-staging-playfuls-projects.vercel.app`) apunta **siempre al último deploy de la rama** `staging`. Para deshacer:

```bash
git fetch origin
git checkout staging
# commit normal:
git revert <sha>
# si el SHA es un merge commit (PRs hacia staging se mergean con merge commit):
git revert -m 1 <sha>
git push origin staging
```

`-m 1` conserva el primer padre (la línea de `staging`) y deshace el lado de la feature. Tras el push, esperar a que el deploy de esa rama quede `READY`; el alias fijo sirve ya el revert.

### Producción

1. **Revert del squash commit en `main`** (preferido: el código vuelve atrás y queda rastro en git). Abrir un PR de revert de **ese** squash (no revertir `staging` entero). Con GO, squash-merge a `main`. Luego resync: mergear `main` en `staging`.
2. **Instant Rollback de Vercel** al deploy de producción anterior (incidente: vuelve el tráfico ya). No cambia git; hay que completar después el revert en `main` para que el siguiente push no reintroduzca el fallo.

**Límite Hobby (doc oficial, leída 29 sep 2026):** en Hobby solo se puede hacer Instant Rollback **al deploy de producción inmediatamente anterior**. Pro/Enterprise pueden elegir cualquier deploy que haya estado aliased a un dominio de producción. Los preview (incluida la rama `staging`) **no** son elegibles. Si se pide un deploy más antiguo: `To roll back further than the previous production deployment, upgrade to pro`.

Fuentes: [Instant Rollback](https://vercel.com/docs/instant-rollback) y [vercel rollback (CLI)](https://vercel.com/docs/cli/rollback).

Tras un Instant Rollback, Vercel desactiva la asignación automática de dominios de producción hasta que se deshaga el rollback (promote). Ver «Undo a rollback» en esa misma doc.

### Plantilla de card «En staging» (copiar)

```
Título: [staging] <qué cambió>

Enlace directo:
- Preview del PR: <url del comentario del bot de Vercel>
- URL fija + ruta: https://playful-headless-git-staging-playfuls-projects.vercel.app/<ruta>

Qué cambió:
<una o dos frases>

Quién: <nombre>
Hora (Europe/Madrid): <YYYY-MM-DD HH:MM>
Card de origen: <url de la card / id ClickUp>

SHA anterior (staging): <sha>
SHA nuevo (staging): <sha>

Deploy anterior:
- URL: https://<deployment-url>
- id: dpl_<id>  (o id de GitHub Deployments)

Deploy nuevo:
- URL: https://<deployment-url>
- id: dpl_<id>

Comando exacto para deshacer:
git checkout staging && git revert <SHA_NUEVO> && git push origin staging
# si SHA_NUEVO es merge commit:
git checkout staging && git revert -m 1 <SHA_NUEVO> && git push origin staging
```

### Al pasar a producción (mismos campos, sobre `main`)

```
Título: [prod] <qué cambió>

Enlace directo (prod): https://playfulagency.com/<ruta>
PR de la feature → main: <url>
GO: José / Alejandra — <hora Madrid>

Qué cambió:
<igual que en staging>

Quién: <nombre>
Hora (Europe/Madrid): <YYYY-MM-DD HH:MM>
Card de origen (la de «En staging»): <url>

SHA anterior (main): <sha>
SHA nuevo (main, squash): <sha>

Deploy anterior (producción):
- URL: https://<deployment-url>
- id: dpl_<id>

Deploy nuevo (producción):
- URL: https://<deployment-url>
- id: dpl_<id>

Comando exacto para deshacer:
# revert en git (PR de revert del squash, luego squash-merge a main):
git revert <SHA_NUEVO_MAIN>
# incidente (Hobby = solo el deploy de producción inmediatamente anterior):
# dashboard → Instant Rollback  |  vercel rollback
```

## Checklist rápido

- [ ] Rama de feature creada desde `main`
- [ ] PR → `staging` (merge commit) para verlo en la URL fija
- [ ] Card ClickUp en **«En staging»** con enlace directo (preview PR + URL fija + ruta), qué cambió, quién y hora Madrid — sin card no cuenta
- [ ] GO de José o Alejandra desde **«En staging»**
- [ ] PR de la **misma** feature → `main` (squash)
- [ ] `main` mergeado de vuelta a `staging`
