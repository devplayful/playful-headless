const AMP_JUNK_PARAM_NAMES = new Set(['amp', 'noamp']);

export function isAmpJunkParam(name: string): boolean {
  return AMP_JUNK_PARAM_NAMES.has(name.toLowerCase());
}

export function isBlogPath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return path === '/blog' || path.startsWith('/blog/');
}

/**
 * Drop AMP junk (`amp`, `noamp`, any case) and keep the rest in order
 * (utm_*, gclid, fbclid, gbraid, wbraid, page, …).
 */
export function stripAmpJunkParams(searchParams: URLSearchParams): {
  stripped: boolean;
  params: URLSearchParams;
} {
  const params = new URLSearchParams();
  let stripped = false;

  searchParams.forEach((value, key) => {
    if (isAmpJunkParam(key)) {
      stripped = true;
      return;
    }
    params.append(key, value);
  });

  return { stripped, params };
}

export function searchFromParams(params: URLSearchParams): string {
  const query = params.toString();
  return query ? `?${query}` : '';
}

export type AmpJunkDecision =
  | { type: 'next' }
  | { type: 'redirect'; pathname: string; search: string; status: 301 };

export type BlogCategoryRedirectMap = Record<string, string>;

export type BlogSeoDecision =
  | { type: 'next' }
  | { type: 'redirect'; pathname: string; search: string; status: 301 | 308 };

export function blogAmpJunkDecision(
  pathname: string,
  searchParams: URLSearchParams,
): AmpJunkDecision {
  const decision = blogSeoRedirectDecision(pathname, searchParams, {});
  if (decision.type === 'redirect') {
    return { ...decision, status: 301 };
  }
  return decision;
}

/**
 * One hop for blog SEO: apply the category alias map and strip AMP junk
 * together. Path changes stay 308 (same as the previous next.config rules);
 * junk-only stays 301.
 */
export function blogSeoRedirectDecision(
  pathname: string,
  searchParams: URLSearchParams,
  categoryRedirects: BlogCategoryRedirectMap,
): BlogSeoDecision {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (!isBlogPath(path)) {
    return { type: 'next' };
  }

  const { stripped, params } = stripAmpJunkParams(searchParams);
  const canonicalPath = categoryRedirects[path] ?? path;
  const pathChanged = canonicalPath !== path;

  if (!pathChanged && !stripped) {
    return { type: 'next' };
  }

  return {
    type: 'redirect',
    pathname: canonicalPath,
    search: searchFromParams(params),
    status: pathChanged ? 308 : 301,
  };
}
