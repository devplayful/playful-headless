import posts from '../../data/wp-snapshot/collections/posts.json' with { type: 'json' };
import categories from '../../data/wp-snapshot/collections/categories.json' with { type: 'json' };
import users from '../../data/wp-snapshot/collections/users.json' with { type: 'json' };
import media from '../../data/wp-snapshot/collections/media.json' with { type: 'json' };
import pages from '../../data/wp-snapshot/collections/pages.json' with { type: 'json' };
import podcast from '../../data/wp-snapshot/collections/podcast.json' with { type: 'json' };
import equipo from '../../data/wp-snapshot/collections/equipo.json' with { type: 'json' };
import casosDeExito from '../../data/wp-snapshot/collections/casos-de-exito.json' with { type: 'json' };
import manifest from '../../data/wp-snapshot/manifest.json' with { type: 'json' };

export const SNAPSHOT_ROOT = 'data/wp-snapshot';

const COLLECTIONS = {
  posts,
  categories,
  users,
  media,
  pages,
  podcast,
  equipo,
  'casos-de-exito': casosDeExito,
};

export function loadCollection(name) {
  const data = COLLECTIONS[name];
  if (!data) {
    throw new Error(`WordPress snapshot collection missing: ${name}`);
  }
  return data;
}

export function snapshotManifest() {
  return manifest;
}
