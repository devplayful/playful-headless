import { getPayload } from 'payload';
import config from '@payload-config';
import {
  HOME_MAIN_CONTENT,
  HOME_MAIN_SLUG,
  type HomeMainContent,
} from '../cms/data/home-main-content.ts';
import { hasRuntimeDatabase } from './cms-database.ts';

function isHomeMainContent(value: unknown): value is HomeMainContent {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return Boolean(record.hero && record.problemas && record.cta);
}

export async function getHomeContentFromPayload(): Promise<HomeMainContent | null> {
  if (!hasRuntimeDatabase()) return null;
  try {
    const payload = await getPayload({ config });
    const found = await payload.find({
      collection: 'home',
      where: { slug: { equals: HOME_MAIN_SLUG } },
      limit: 1,
      depth: 0,
    });
    const raw = found.docs[0]?.content;
    if (isHomeMainContent(raw)) return raw;
    return null;
  } catch {
    return null;
  }
}

/** Fallback al copy congelado de main si la BD aún no tiene fila. */
export async function resolveHomeContentForPayloadRender(): Promise<HomeMainContent> {
  const fromDb = await getHomeContentFromPayload();
  return fromDb ?? HOME_MAIN_CONTENT;
}
