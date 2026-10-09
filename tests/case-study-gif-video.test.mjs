import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const {
  CASE_STUDY_GIF_VIDEOS,
  caseStudyGifVideoForSrc,
} = await import('../lib/case-study-gif-video.ts');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const page = readFileSync(new URL('../app/casos-de-exito/[slug]/page.tsx', import.meta.url), 'utf8');

test('Jumex UX and Odwalla drink GIFs map to local mp4, webm and poster', () => {
  const jumex = caseStudyGifVideoForSrc(
    'https://endpoint.playfulagency.com/wp-content/uploads/2025/11/JumexUX-Pagina-web.gif',
  );
  const odwalla = caseStudyGifVideoForSrc(
    'https://endpoint.playfulagency.com/wp-content/uploads/2025/11/Drink-Odwalla-pagina-web.gif',
  );
  assert.deepEqual(jumex, CASE_STUDY_GIF_VIDEOS['JumexUX-Pagina-web.gif']);
  assert.deepEqual(odwalla, CASE_STUDY_GIF_VIDEOS['Drink-Odwalla-pagina-web.gif']);
  assert.equal(
    caseStudyGifVideoForSrc(
      'https://endpoint.playfulagency.com/wp-content/uploads/2025/11/Jumex.com-Pagina-web-anterior-completo.gif',
    ),
    null,
  );
});

test('video files exist and stay well under the original GIF weight', () => {
  for (const assets of Object.values(CASE_STUDY_GIF_VIDEOS)) {
    for (const rel of Object.values(assets)) {
      const file = join(root, 'public', rel.replace(/^\//, ''));
      assert.ok(existsSync(file), rel);
      assert.ok(statSync(file).size < 2 * 1024 * 1024, `${rel} is ${statSync(file).size}`);
    }
  }
});

test('case study template uses CaseStudyMedia and a looping muted video', () => {
  assert.match(page, /from ['"]@\/components\/casos\/CaseStudyMedia['"]/);
  const source = readFileSync(new URL('../components/casos/CaseStudyMedia.tsx', import.meta.url), 'utf8');
  assert.match(source, /autoPlay/);
  assert.match(source, /muted/);
  assert.match(source, /loop/);
  assert.match(source, /playsInline/);
  assert.match(source, /<source src=\{video\.webm\} type="video\/webm"/);
  assert.match(source, /<source src=\{video\.mp4\} type="video\/mp4"/);
});
