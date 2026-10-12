function metaContent(html, { name, property }) {
  const attr = name ? 'name' : 'property';
  const value = name ?? property;
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${value}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${value}["']`,
    'i',
  );
  const match = html.match(re);
  return (match?.[1] ?? match?.[2] ?? '').trim();
}

function linkHref(html, rel) {
  const re = new RegExp(
    `<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']*)["']|<link[^>]+href=["']([^"']*)["'][^>]+rel=["']${rel}["']`,
    'i',
  );
  const match = html.match(re);
  return (match?.[1] ?? match?.[2] ?? '').trim();
}

export function extractPageHtmlSeo(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
  return {
    title,
    description: metaContent(html, { name: 'description' }),
    canonical: linkHref(html, 'canonical'),
    ogTitle: metaContent(html, { property: 'og:title' }),
    ogDescription: metaContent(html, { property: 'og:description' }),
    ogImage: metaContent(html, { property: 'og:image' }),
    twitterTitle: metaContent(html, { name: 'twitter:title' }),
    twitterDescription: metaContent(html, { name: 'twitter:description' }),
    twitterImage: metaContent(html, { name: 'twitter:image' }),
  };
}

export function assertPageHtmlSeo(route, seo) {
  const problems = [];
  if (!seo.title) problems.push('missing <title>');
  if (!seo.description) problems.push('missing meta description');
  if (!seo.canonical) problems.push('missing canonical link');
  if (seo.ogTitle && seo.twitterTitle && seo.ogTitle !== seo.twitterTitle) {
    problems.push(`twitter:title (${seo.twitterTitle}) !== og:title (${seo.ogTitle})`);
  }
  if (seo.ogDescription && seo.twitterDescription && seo.ogDescription !== seo.twitterDescription) {
    problems.push('twitter:description !== og:description');
  }
  if (seo.ogImage && seo.twitterImage && seo.ogImage !== seo.twitterImage) {
    problems.push('twitter:image !== og:image');
  }
  if (seo.ogTitle && !seo.twitterTitle) problems.push('missing twitter:title while og:title is set');
  if (seo.ogDescription && !seo.twitterDescription) {
    problems.push('missing twitter:description while og:description is set');
  }
  if (seo.ogImage && !seo.twitterImage) problems.push('missing twitter:image while og:image is set');
  return problems.length ? { route, problems } : null;
}
