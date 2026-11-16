import { load } from 'cheerio';

export function extractH1FromElementorHtml(html: string): string | null {
  const $ = load(html);
  const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
  return h1 || null;
}
