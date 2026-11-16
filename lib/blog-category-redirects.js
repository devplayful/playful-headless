const fs = require('fs');
const path = require('path');

const SNAPSHOT_POSTS_PATH = path.join(__dirname, '..', 'data', 'wp-snapshot', 'collections', 'posts.json');
const MAP_PATH = path.join(__dirname, '..', 'utils', 'blog-category-redirect-map.json');
const CANIBALIZACION_MAP = require('../utils/blog-canibalizacion-redirect-map.json');

function retargetCanibalizacionDestination(destination) {
  const absolute = CANIBALIZACION_MAP[destination];
  if (!absolute) return destination;
  try {
    return new URL(absolute).pathname;
  } catch {
    return destination;
  }
}

function loadSnapshotPosts() {
  if (!fs.existsSync(SNAPSHOT_POSTS_PATH)) {
    throw new Error(`Missing snapshot posts at ${SNAPSHOT_POSTS_PATH}`);
  }
  const posts = JSON.parse(fs.readFileSync(SNAPSHOT_POSTS_PATH, 'utf8'));
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('Refusing to build without the snapshot blog redirect inventory');
  }
  return posts;
}

function buildBlogCategoryRedirects(posts) {
  const redirects = new Map();

  for (const post of posts) {
    const categories = post._embedded?.['wp:term']?.[0]
      ?.filter((term) => term.taxonomy === 'category') ?? [];
    const primaryCategory = categories[0]?.slug || 'sin-categoria';
    const destination = retargetCanibalizacionDestination(
      `/blog/${primaryCategory}/${post.slug}`,
    );

    for (const category of categories.slice(1)) {
      if (!category.slug || category.slug === primaryCategory) continue;
      redirects.set(`/blog/${category.slug}/${post.slug}`, destination);
    }
  }

  return [...redirects.entries()].map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  }));
}

function persistBlogCategoryRedirectMap(rules) {
  const map = {};
  for (const { source, destination } of [...rules].sort((left, right) => (
    left.source.localeCompare(right.source, 'en')
  ))) {
    map[source] = retargetCanibalizacionDestination(destination);
  }
  fs.writeFileSync(MAP_PATH, `${JSON.stringify(map, null, 2)}\n`);
  return map;
}

async function getBlogCategoryRedirects() {
  return buildBlogCategoryRedirects(loadSnapshotPosts());
}

module.exports = {
  MAP_PATH,
  buildBlogCategoryRedirects,
  getBlogCategoryRedirects,
  persistBlogCategoryRedirectMap,
};
