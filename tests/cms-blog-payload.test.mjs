import assert from 'node:assert/strict';
import test from 'node:test';

const { isCmsBlogFromPayload, CMS_BLOG_FROM_PAYLOAD_ENV, shouldRenderBlogFromPayload } =
  await import('../lib/cms-blog-flag.ts');
const { mapPayloadPostDocToWpPost } = await import('../lib/cms-blog-map.ts');

test('CMS_BLOG_FROM_PAYLOAD env gate', () => {
  assert.equal(isCmsBlogFromPayload({ [CMS_BLOG_FROM_PAYLOAD_ENV]: 'false' }), false);
  assert.equal(isCmsBlogFromPayload({ [CMS_BLOG_FROM_PAYLOAD_ENV]: 'true' }), true);
});

test('?cms=1 solo activa blog Payload en preview', () => {
  assert.equal(
    shouldRenderBlogFromPayload(true, { VERCEL_ENV: 'preview', [CMS_BLOG_FROM_PAYLOAD_ENV]: 'false' }),
    true,
  );
  assert.equal(
    shouldRenderBlogFromPayload(true, { VERCEL_ENV: 'production', [CMS_BLOG_FROM_PAYLOAD_ENV]: 'false' }),
    false,
  );
});

test('mapPayloadPostDocToWpPost conserva date_gmt y categoría', () => {
  const post = mapPayloadPostDocToWpPost({
    wpId: 86152,
    slug: 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
    titulo: 'Zelle en Venezuela',
    date: '2025-10-01T12:00:00.000Z',
    wpDate: '2025-10-01T14:00:00',
    modifiedGmt: '2025-10-02T08:00:00.000Z',
    contentHtml: '<p>Hola</p>',
    extracto: 'Lead',
    estado: 'publish',
    categoria: { wpId: 3, slug: 'tecnologia', nombre: 'Tecnología' },
    yoast: {
      title: 'Zelle | Playful',
      description: 'Desc',
      canonical: 'https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
    },
  });
  assert.ok(post);
  assert.equal(post.id, 86152);
  assert.equal(post.categories?.[0]?.slug, 'tecnologia');
  assert.equal(post.date_gmt, '2025-10-01T12:00:00.000Z');
  assert.equal(post.yoast_head_json?.canonical?.includes('zelle'), true);
  assert.equal(post.content?.rendered, '<p>Hola</p>');
});
