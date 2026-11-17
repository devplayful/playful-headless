import { getPayload } from 'payload';
import config from '@payload-config';
import type { TeamMember } from '@/services/wordpress';
import { getTeamMembers } from '@/services/wordpress';
import { hasRuntimeDatabase } from './cms-database.ts';
import { withPayloadOrSnapshot } from './cms-fallback.ts';
import { shouldRenderEquipoFromPayload } from './cms-equipo-flag.ts';
import { applyBlobImagesToUrl } from './blob-image-render.ts';

function mapMember(doc: Record<string, unknown>): TeamMember | null {
  const slug = typeof doc.slug === 'string' ? doc.slug : '';
  if (!slug) return null;
  let featured = '';
  if (doc.imagenDestacada && typeof doc.imagenDestacada === 'object') {
    const media = doc.imagenDestacada as Record<string, unknown>;
    if (typeof media.url === 'string') featured = applyBlobImagesToUrl(media.url);
  }
  const acf = (doc.acf as TeamMember['acf']) ?? {
    habilidades: [],
    descripcion: '',
    linkedin_url: '',
    imagen: { url: featured, alt: '' },
  };
  if (typeof doc.cargo === 'string' && doc.cargo) {
    acf.cargo = doc.cargo;
  }
  return {
    id: typeof doc.wpId === 'number' ? doc.wpId : 0,
    title: { rendered: typeof doc.titulo === 'string' ? doc.titulo : slug },
    excerpt: { rendered: typeof doc.extracto === 'string' ? doc.extracto : '' },
    acf,
  } as TeamMember;
}

export async function getTeamMembersWithCms(
  options: { renderFromPayload?: boolean } = {},
): Promise<TeamMember[]> {
  const usePayload = options.renderFromPayload ?? shouldRenderEquipoFromPayload(false);
  return withPayloadOrSnapshot(
    usePayload,
    async () => {
      if (!hasRuntimeDatabase()) return [];
      const payload = await getPayload({ config });
      const found = await payload.find({
        collection: 'equipo',
        limit: 20,
        depth: 2,
      });
      return found.docs
        .map((d) => mapMember(d as unknown as Record<string, unknown>))
        .filter((m): m is TeamMember => Boolean(m));
    },
    () => getTeamMembers(),
  );
}