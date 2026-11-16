/**
 * Paridad Home `/`: prod vs preview HTML (archivo local o URL en PREVIEW_HOME_HTML).
 * Peticiones a prod: UA PlayfulQA/1.0, ?qa=1, ≥1s entre requests.
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const UA = 'PlayfulQA/1.0';
const PROD_URL = 'https://playfulagency.com/?qa=1';

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* throttle prod */
  }
}

class T {
  constructor() {
    this.skip = 0;
    this.txt = [];
    this.alts = [];
    this.vids = [];
  }

  /** @param {string} t @param {{name:string,value:string}[]} attrs */
  onStartTag(t, attrs) {
    const a = Object.fromEntries(attrs.map(({ name, value }) => [name, value]));
    if (['script', 'style', 'noscript', 'template'].includes(t)) this.skip += 1;
    if (t === 'img') {
      this.alts.push([
        a.alt,
        (a.src || '').split('url=').pop()?.replace(/[?&].*/, '') || '',
      ]);
    }
    if ((t === 'video' || t === 'source') && a.src) this.vids.push(a.src);
  }

  onEndTag(t) {
    if (['script', 'style', 'noscript', 'template'].includes(t) && this.skip) this.skip -= 1;
  }

  onText(d) {
    if (!this.skip && d.trim()) this.txt.push(d.trim().replace(/\s+/g, ' '));
  }
}

function stripAndParse(html) {
  const p = new T();
  const tagRe = /<\/?([a-zA-Z0-9:-]+)([^>]*)>|([^<]+)/g;
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    if (m[3]) {
      p.onText(m[3]);
      continue;
    }
    const tag = m[1].toLowerCase();
    const rawAttrs = m[2] || '';
    const attrs = [];
    const attrRe = /([a-zA-Z_:.-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
    let am;
    while ((am = attrRe.exec(rawAttrs)) !== null) {
      attrs.push({ name: am[1], value: am[3] ?? am[4] ?? am[5] ?? '' });
    }
    if (m[0].startsWith('</')) p.onEndTag(tag);
    else p.onStartTag(tag, attrs);
  }
  return p;
}

function extractMeta(h) {
  const canon = h.match(/<link[^>]+rel="canonical"[^>]*>/gi) || [];
  const ld = [...h.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(
    (x) => x[1].replace(/\s+/g, ''),
  );
  const title = [...h.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((x) => x[1]);
  const meta = [...h.matchAll(/<meta name="description" content="([^"]*)"/gi)].map((x) => x[1]);
  return { canon, ld, title, meta };
}

function snapshot(html) {
  const parsed = stripAndParse(html);
  return {
    text: parsed.txt,
    alts: parsed.alts,
    vids: parsed.vids,
    ...extractMeta(html),
  };
}

function fetchProd() {
  const res = spawnSync(
    'curl',
    ['-s', '-A', UA, PROD_URL],
    { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
  );
  return res.stdout || '';
}

function loadPreview() {
  const file = process.env.PREVIEW_HOME_HTML;
  const url = process.env.PREVIEW_HOME_URL;
  if (file) return readFileSync(file, 'utf8');
  if (url) {
    sleep(1100);
    const res = spawnSync('curl', ['-s', '-A', UA, url], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
    return res.stdout || '';
  }
  return null;
}

function diffKeys(a, b) {
  const lines = [];
  for (const k of Object.keys(a)) {
    if (JSON.stringify(a[k]) === JSON.stringify(b[k])) {
      lines.push(`  ${k}: IGUAL (${Array.isArray(a[k]) ? a[k].length : 1})`);
    } else {
      lines.push(
        `  ${k}: DIFERENTE prod=${Array.isArray(b[k]) ? b[k].length : 1} preview=${Array.isArray(a[k]) ? a[k].length : 1}`,
      );
    }
  }
  return lines;
}

const prodHtml = fetchProd();
sleep(1100);
const previewHtml = loadPreview();

console.log('== /  (Home)');
console.log(`  prod fetch: ${prodHtml.length} bytes`);

if (!previewHtml) {
  console.log('  preview: NO MEDIDO (sin PREVIEW_HOME_HTML ni PREVIEW_HOME_URL accesible desde este entorno)');
  process.exit(0);
}

const preview = snapshot(previewHtml);
const prod = snapshot(prodHtml);
const cmsAttr = previewHtml.includes('data-cms-source="payload"');
console.log(`  cms-source payload en preview: ${cmsAttr}`);
console.log(diffKeys(preview, prod).join('\n'));
