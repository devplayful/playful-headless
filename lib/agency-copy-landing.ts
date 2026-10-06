export const SITE_OG_IMAGE = 'https://playfulagency.com/og.jpg';

export type AgencyFaqItem = {
  question: string;
  answer: string;
};

export type AgencyStep = {
  lead: string;
  body: string;
};

export type AgencyBlock =
  | { type: 'p'; text: string }
  | { type: 'quote'; quote: string; attribution: string };

export type AgencySection = {
  h2: string;
  variant: 'cream' | 'mint' | 'plain' | 'purple';
  blocks: readonly AgencyBlock[];
};

export type AgencyLandingCopy = {
  meta: {
    title: string;
    description: string;
    path: string;
    serviceName: string;
  };
  ctaLabel: string;
  hero: {
    h1: string;
    paragraphs: readonly string[];
  };
  sections: readonly AgencySection[];
  process: {
    h2: string;
    steps: readonly AgencyStep[];
  };
  faq: {
    h2: string;
    items: readonly AgencyFaqItem[];
  };
  closing: {
    h2: string;
    body: string;
  };
};

const MARKDOWN_TOKEN_RE =
  /(\[[^\]]+\]\(https?:\/\/[^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;

export type MarkdownPart =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string; href: string }
  | { type: 'strong'; value: string }
  | { type: 'code'; value: string };

export function splitMarkdown(text: string): MarkdownPart[] {
  const parts: MarkdownPart[] = [];
  const matcher = new RegExp(MARKDOWN_TOKEN_RE.source, 'g');
  let lastIndex = 0;
  let match = matcher.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const token = match[0];
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      parts.push({ type: 'link', value: link[1], href: link[2] });
    } else if (token.startsWith('**')) {
      parts.push({ type: 'strong', value: token.slice(2, -2) });
    } else if (token.startsWith('`')) {
      parts.push({ type: 'code', value: token.slice(1, -1) });
    } else {
      parts.push({ type: 'text', value: token });
    }
    lastIndex = match.index + token.length;
    match = matcher.exec(text);
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return parts;
}

export function toInternalHref(href: string): string {
  if (href === 'https://api.playfulagency.com/widget/bookings/reunion-playful') {
    return '/reunion-playful';
  }
  if (href.startsWith('https://playfulagency.com')) {
    return href.replace('https://playfulagency.com', '') || '/';
  }
  return href;
}

export function isExternalHref(href: string): boolean {
  return href.startsWith('http') && !href.startsWith('https://playfulagency.com');
}

export function buildAgencyLandingJsonLd(copy: AgencyLandingCopy, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: copy.meta.serviceName,
        description: copy.meta.description,
        url: pageUrl,
        provider: {
          '@type': 'Organization',
          name: 'Playful Agency',
          url: 'https://playfulagency.com',
        },
        areaServed: ['ES', 'VE', 'MX'],
        serviceType: copy.meta.serviceName,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://playfulagency.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: copy.meta.serviceName,
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: copy.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };
}
