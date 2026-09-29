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

## Checklist rápido

- [ ] Rama de feature creada desde `main`
- [ ] PR → `staging` (merge commit) para verlo en la URL fija
- [ ] Card ClickUp en **«En staging»** con enlace directo (preview PR + URL fija + ruta), qué cambió, quién y hora Madrid — sin card no cuenta
- [ ] GO de José o Alejandra desde **«En staging»**
- [ ] PR de la **misma** feature → `main` (squash)
- [ ] `main` mergeado de vuelta a `staging`
