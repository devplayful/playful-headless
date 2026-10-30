import { createHash, timingSafeEqual } from 'node:crypto';

/** Ancla de la cadena de tokens por lote (hex sha256, minúscula). */
export const H2_BATCH_ANCHOR =
  '8c68dd9da3c2973998fecf93f4a953d7f980233f25e06748af0d20b7416a56ad';

/** Longitud de la cadena generada hacia la ancla (documentación operativa). */
export const H2_BATCH_K = 74;

export const H2_BATCH_SIZE = 40;
export const H2_MAX_BATCH_INDEX = 72;

export function h2HashHex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Valida el token de un lote: t es hex 64; h aplicada (b+1) veces debe igualar anchor.
 */
export function verifyH2BatchToken(
  b: number,
  t: string,
  anchor: string = H2_BATCH_ANCHOR,
  maxBatchIndex: number = H2_MAX_BATCH_INDEX,
): boolean {
  if (!Number.isInteger(b) || b < 0 || b > maxBatchIndex) return false;
  if (typeof t !== 'string' || !/^[0-9a-fA-F]{64}$/.test(t)) return false;
  let cur = t.toLowerCase();
  for (let i = 0; i < b + 1; i++) {
    cur = h2HashHex(cur);
  }
  const expected = Buffer.from(anchor, 'utf8');
  const actual = Buffer.from(cur, 'utf8');
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
