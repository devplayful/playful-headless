import ElementorPageContent from '@/components/ElementorPageContent';
import type { ServicioBlock, ServicioDoc } from '@/lib/cms-servicios';
import { elementorBlockFromDoc } from '@/lib/cms-servicios';
import { getServiceFaqJsonLd } from '@/utils/service-faq-jsonld';
import {
  buildServiceLandingJsonLd,
  serializeServiceLandingJsonLd,
} from '@/utils/service-landing-jsonld';
import { applyPageDescriptionOverride } from '@/utils/page-seo-overrides.mjs';
import AgenciaShopifyFromPayload from './AgenciaShopifyFromPayload';

type Props = {
  doc: ServicioDoc;
  slug: string;
};

function faqJsonLdFromBlocks(blocks: ServicioBlock[] | null | undefined) {
  const faq = blocks?.find((b) => b.blockType === 'faq');
  if (!faq || !Array.isArray(faq.items)) return null;
  const items = faq.items
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const item = raw as Record<string, unknown>;
      const question = typeof item.question === 'string' ? item.question : '';
      const answer = typeof item.answer === 'string' ? item.answer : '';
      if (!question || !answer) return null;
      return {
        '@type': 'Question' as const,
        name: question,
        acceptedAnswer: { '@type': 'Answer' as const, text: answer },
      };
    })
    .filter(Boolean);
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items,
  };
}

export default async function ServicioPayloadRenderer({ doc, slug }: Props) {
  const elementor = elementorBlockFromDoc(doc);
  const landingJsonLd = buildServiceLandingJsonLd(
    slug,
    applyPageDescriptionOverride(slug, doc.yoast?.description || '', undefined).description,
  );
  const faqJsonLd =
    slug === 'agencia-shopify'
      ? faqJsonLdFromBlocks(doc.bloques) || null
      : getServiceFaqJsonLd(slug);

  if (slug === 'agencia-shopify' && !elementor) {
    return (
      <>
        {faqJsonLd ? (
          <script
            id="playful-faq"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeServiceLandingJsonLd(faqJsonLd) }}
          />
        ) : null}
        {landingJsonLd ? (
          <>
            <script
              id="playful-service"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: serializeServiceLandingJsonLd(landingJsonLd.service) }}
            />
            <script
              id="playful-breadcrumb"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: serializeServiceLandingJsonLd(landingJsonLd.breadcrumb) }}
            />
          </>
        ) : null}
        <AgenciaShopifyFromPayload doc={doc} />
      </>
    );
  }

  if (!elementor) return null;

  return (
    <>
      {landingJsonLd ? (
        <>
          <script
            id="playful-service"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeServiceLandingJsonLd(landingJsonLd.service) }}
          />
          <script
            id="playful-breadcrumb"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeServiceLandingJsonLd(landingJsonLd.breadcrumb) }}
          />
        </>
      ) : null}
      {faqJsonLd ? (
        <script
          id="playful-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeServiceLandingJsonLd(faqJsonLd) }}
        />
      ) : null}
      <ElementorPageContent
        html={elementor.html}
        pageId={elementor.pageId}
        stylesheetIds={elementor.stylesheetIds}
        slug={slug}
      />
    </>
  );
}
