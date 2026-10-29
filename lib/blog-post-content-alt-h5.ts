/**
 * Alts SEO fase H5 en el HTML servido del blog (WordPress → Next).
 * La plantilla lee `post.content.rendered`; Payload `contentHtml` es paralelo (admin/import).
 */
import { activeH5ContentAltOverrides } from '../cms/data/posts-content-alt-h5.ts';
import {
  applyContentAltOverrides,
  contentImages,
  readAltFromPostHtml,
} from '../cms/lib/post-content-images.ts';

export function applyBlogPostContentAltH5ToHtml(html: string, wpId: number): string {
  if (!html || !wpId) return html;
  const { html: next } = applyContentAltOverrides(
    wpId,
    html,
    contentImages(html),
    activeH5ContentAltOverrides(false),
  );
  return next;
}

export function applyBlogPostContentAltH5<T extends { id?: number; content?: { rendered?: string } }>(
  post: T,
): T {
  if (!post?.id || typeof post.content?.rendered !== 'string') return post;
  return {
    ...post,
    content: {
      ...post.content,
      rendered: applyBlogPostContentAltH5ToHtml(post.content.rendered, post.id),
    },
  };
}

export { readAltFromPostHtml };
