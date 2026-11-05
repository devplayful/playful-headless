/**
 * Comprueba si la URL pública del post 66684 responde 200 (criterio B, fila 33).
 */
import { POST_66684_PUBLIC_PATH } from '../cms/data/posts-content-alt-h5.ts';

const UA = 'PlayfulQA/1.0';
const ORIGIN = (process.env.PLAYFUL_PUBLIC_ORIGIN || 'https://playfulagency.com').replace(/\/$/, '');

export type Post66684HttpProbe = {
  url: string;
  status: number;
  checkedAt: string;
};

export async function probePost66684PublicStatus(): Promise<Post66684HttpProbe> {
  const url = `${ORIGIN}${POST_66684_PUBLIC_PATH}?qa=1`;
  const res = await fetch(url, {
    method: 'HEAD',
    redirect: 'manual',
    headers: { 'User-Agent': UA },
  });
  return { url, status: res.status, checkedAt: new Date().toISOString() };
}

export function shouldApply66684ContentAlt(probe: Post66684HttpProbe): boolean {
  return probe.status === 200;
}
