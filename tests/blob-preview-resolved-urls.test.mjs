import test from 'node:test';
import assert from 'node:assert/strict';

process.env.VERCEL_ENV = 'preview';
process.env.VERCEL_GIT_COMMIT_REF = 'cursor/payload-h2-imagenes-5a28';

const PREVIEW_ENV = {
  ...process.env,
  VERCEL_ENV: 'preview',
  VERCEL_GIT_COMMIT_REF: 'cursor/payload-h2-imagenes-5a28',
};

const { rewriteEndpointAssetUrlForPreview } = await import('../lib/wp-endpoint-surface.ts');
const { lookupBlobMapTarget, maybeRewriteMediaUrl } = await import('../lib/blob-image-url.ts');
const { loadBlobMigrationMap, clearBlobMigrationMapCache } = await import('../lib/blob-image-map.ts');

const WP = 'https://endpoint.playfulagency.com/wp-content/uploads';

const TEAM_AVATARS = [
  `${WP}/2025/10/Jose-Miguel-Reyes.-Director-Fundador.png`,
  `${WP}/2025/10/Alejandro-Da-Costa.-Directora-Fundadora.png`,
  `${WP}/2025/10/Stefanni-Paravabidez.-Redactora-creativa-Seo.png`,
  `${WP}/2025/10/Avata-Playful.png`,
  `${WP}/2025/10/Arturo-Tovar-Avatar.png`,
  `${WP}/2025/10/Indira-Jaen.-Disenador-UIUX.png`,
];

const PODCAST_COVER = `${WP}/2022/06/E1_T2_Podcast-Bendita-Web.jpg`;

const ZELLE_WP = `${WP}/2022/01/Conoce-los-aspectos-básicos-de-las-criptomonedas_2.png`;

/** Uploads en las 9 páginas QA que deben resolver a Blob (entrada en mapa). */
const QA_PAGE_BLOB_SOURCES = [
  `${WP}/2020/08/TAPA_¿Que-es-Google-Ad-Grants-150x150.png`,
  `${WP}/2024/09/Haz-Pruebas-y-%E2%80%A8Optimiza-tus-Campanas.png`,
  ZELLE_WP,
  `${WP}/2024/09/PLAYFUL-CASOS-DE-EXITO_Fundahigado.png`,
  `${WP}/2025/11/Azul.png`,
  `${WP}/2024/09/Potencia-tu-presencia-con-publicidad.png`,
  `${WP}/2024/09/Agencia-de-diseno-web.png`,
];

test('nosotros avatars and podcast cover stay on /wp-static when absent from blob map', () => {
  clearBlobMigrationMapCache();
  const map = loadBlobMigrationMap(PREVIEW_ENV);
  for (const href of [...TEAM_AVATARS, PODCAST_COVER]) {
    assert.equal(lookupBlobMapTarget(href, map || {}), undefined, href);
    const out = rewriteEndpointAssetUrlForPreview(href, PREVIEW_ENV);
    assert.match(out, /^\/wp-static\/wp-content\/uploads\//, out);
    assert.doesNotMatch(out, /\.public\.blob\.vercel-storage\.com/, out);
  }
});

test('Zelle criptomonedas maps with NFD key and public URL is fetchable (200)', async () => {
  clearBlobMigrationMapCache();
  const map = loadBlobMigrationMap(PREVIEW_ENV);
  const target = lookupBlobMapTarget(ZELLE_WP, map || {});
  assert.ok(target, 'expected blob map entry for Zelle inline image');
  assert.match(target, /ba%CC%81sicos/, 'blob key uses NFD combining acute in storage');
  const out = rewriteEndpointAssetUrlForPreview(ZELLE_WP, PREVIEW_ENV);
  assert.match(out, /\.public\.blob\.vercel-storage\.com\/media\/2022\/01\//);
  assert.match(out, /ba%25CC%2581sicos/, 'single re-encode of stored key (% → %25)');
  assert.doesNotMatch(out, /%25C3%25A1/, 'must not NFC-normalize to C3 A1');
  const res = await fetch(out, { method: 'HEAD', headers: { 'User-Agent': 'PlayfulQA/1.0' } });
  assert.equal(res.status, 200, out);
});

test('maybeRewriteMediaUrl does not invent blob URLs without map entry', () => {
  clearBlobMigrationMapCache();
  const map = loadBlobMigrationMap(PREVIEW_ENV);
  for (const href of TEAM_AVATARS) {
    const out = maybeRewriteMediaUrl(href, map, PREVIEW_ENV);
    assert.equal(out, href);
  }
});

test('HEAD 200 for blob URLs resolved on QA page uploads', async () => {
  clearBlobMigrationMapCache();
  const map = loadBlobMigrationMap(PREVIEW_ENV);
  const resolved = QA_PAGE_BLOB_SOURCES.map((href) => ({
    href,
    url: rewriteEndpointAssetUrlForPreview(href, PREVIEW_ENV),
  }));
  for (const { href, url } of resolved) {
    assert.ok(lookupBlobMapTarget(href, map || {}), `missing map entry: ${href}`);
    assert.match(url, /\.public\.blob\.vercel-storage\.com\//, url);
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'PlayfulQA/1.0' } });
    assert.equal(res.status, 200, url);
  }
});
