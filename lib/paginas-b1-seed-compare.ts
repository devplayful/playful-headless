/** Comparación seed ↔ Payload sin importar @payload-config (scripts Node directos). */

export type PaginaCodigoSeedDoc = {
  content: Record<string, unknown>;
};

export function paginaCodigoContentMatchesSeed(
  doc: PaginaCodigoSeedDoc,
  expectedContent: Record<string, unknown>,
): boolean {
  const expectedChecksum =
    typeof expectedContent.checksum === 'string' ? expectedContent.checksum : '';
  const actualChecksum =
    typeof doc.content.checksum === 'string' ? doc.content.checksum : '';
  if (!expectedChecksum || expectedChecksum !== actualChecksum) return false;
  const expectedBody =
    typeof expectedContent.bodyVersion === 'string' ? expectedContent.bodyVersion : '';
  const actualBody =
    typeof doc.content.bodyVersion === 'string' ? doc.content.bodyVersion : '';
  return expectedBody === actualBody && Boolean(expectedBody);
}
